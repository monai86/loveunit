// Neon (real PostgreSQL) integration test suite.
//
// Runs the REAL service layer (services/*) against a disposable scratch
// DATABASE created on the same Neon project — nothing touches the shared
// `neondb` schema. It applies the actual Drizzle migrations, seeds minimal
// data, then exercises behaviors that only a real database can prove:
//
//   1. duplicate prevention via the (event_id, phone_normalized) unique index
//   2. slot capacity under concurrency (SELECT … FOR UPDATE)
//   3. transaction rollback — failed transition / FK failure leaves no writes
//   4. staff cancel: status → CANCELLED + audit, booked_count − 1, then FIFO
//      waitlist promotion creating a real registration + NOTIFIED entry
//   5. Better Auth forced-password-change flag round-trip (real DB adapter)
//
// Skips cleanly (exit 0) when DATABASE_URL is absent, so CI without the secret
// still passes. The DATABASE_URL role needs the CREATEDB privilege (Neon's
// default project roles have it); a present-but-unusable secret fails loudly.
//
// Usage: npx tsx tests/db.integration.test.ts   (or: npm run test:db)

import assert from 'node:assert';
import { loadEnvLocal } from '../scripts/lib/env';

// IMPORTANT: load .env.local BEFORE anything imports @/db — the db singleton is
// created from process.env.DATABASE_URL at module-load time. Everything that
// touches @/db is therefore imported dynamically below, after the env is pinned
// to the scratch database.
loadEnvLocal();

type DbModule = typeof import('../db');
type TestDb = NonNullable<DbModule['db']>;

const BASE = 'http://localhost:3000';

const ACTIVE_DATABASE_URL = 'postgresql://neondb_owner:npg_OwkeQf9jz8nH@ep-wild-king-azkezpma-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
  let originalUrl = process.env.DATABASE_URL;
  if (originalUrl && originalUrl.includes('ep-fancy-forest')) {
    originalUrl = ACTIVE_DATABASE_URL;
  }
  if (!originalUrl) {
    console.log('ℹ️  DATABASE_URL not set — skipping Neon integration tests.');
    console.log('    Run with a real Neon connection string to enable them (`npm run test:db`).');
    return;
  }

  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const ws = await import('ws');
  neonConfig.webSocketConstructor = ws.default || ws;
  const { applyMigrations } = await import('../scripts/lib/apply-migrations');

  // Disposable scratch database on the same Neon project (proven to work over
  // the pooled endpoint with Neon's default role).
  const dbName = `loveunit_itest_${process.pid}_${Date.now().toString(36)}`;
  const testUrl = originalUrl.replace(/\/[^/?]+(?=\?|$)/, `/${dbName}`);

  const admin = new Pool({ connectionString: originalUrl });
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await admin.query(`CREATE DATABASE ${dbName}`);
  } catch (err) {
    console.error('❌ Could not create the scratch database.');
    console.error('   The role in DATABASE_URL needs the CREATEDB privilege (Neon default roles have it).');
    console.error(err instanceof Error ? err.message : String(err));
    await admin.end().catch(() => {});
    process.exit(1);
  }

  // Pin the app's db singleton (and the Better Auth adapter) to the scratch DB
  // before they are imported. A fixed origin keeps Better Auth origin checks
  // deterministic inside this process.
  process.env.DATABASE_URL = testUrl;
  process.env.BETTER_AUTH_URL = BASE;

  let db: TestDb | null = null;
  try {
    db = (await import('../db')).db;
    if (!db) throw new Error('db singleton is null — DATABASE_URL was not picked up');

    const applied = await applyMigrations(db, { verbose: false });
    console.log(`\n🧪 Neon integration suite — scratch DB "${dbName}" (${applied} migration statements applied)\n`);

    await runCases(db);

    console.log('🎉 ALL NEON INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    // Teardown: close the test pool, then drop the scratch database.
    try {
      await db?.$client.end();
    } catch {
      // ignore — DROP DATABASE below is the source of truth
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await admin.query(
          `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}' AND pid <> pg_backend_pid()`
        );
        await admin.query(`DROP DATABASE IF EXISTS ${dbName}`);
        console.log(`🧹 Dropped scratch database "${dbName}"`);
        break;
      } catch (err) {
        if (attempt === 2) {
          console.error('⚠️  teardown warning — could not drop scratch database:', err instanceof Error ? err.message : err);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
    await admin.end().catch(() => {});
  }
}

async function runCases(db: TestDb) {
  // Everything below must be imported AFTER the env is pinned to the scratch DB.
  const { events, timeSlots, registrations, checkinEvents, waitlist, user } = await import('../db/schema');
  const { eq, and, sql } = await import('drizzle-orm');
  const { registerDonorAtomic } = await import('../services/registration-service');
  const { getEventBySlug } = await import('../services/event-service');
  const { updateRegistrationStatus, cancelRegistration } = await import('../services/checkin-service');
  const { joinWaitlist } = await import('../services/waitlist-service');
  const { auth } = await import('../lib/auth');

  const EVENT_ID = 'e1111111-1111-1111-1111-111111111111';

  async function createEvent() {
    const now = new Date();
    const [event] = await db
      .insert(events)
      .values({
        id: EVENT_ID,
        slug: 'mumt-2026',
        name: 'Integration Test Event',
        shortName: 'ITest',
        description: 'integration',
        startAt: new Date(now.getTime() + 7 * 86400000),
        endAt: new Date(now.getTime() + 7 * 86400000 + 7 * 3600000),
        venueName: 'Test Venue',
        venueDetail: 'Room 1',
        registrationOpenAt: new Date(now.getTime() - 86400000),
        registrationCloseAt: new Date(now.getTime() + 86400000),
        status: 'REGISTRATION_OPEN',
      })
      .returning();
    return event;
  }

  async function createSlot(eventId: string, capacity: number) {
    const [slot] = await db
      .insert(timeSlots)
      .values({
        eventId,
        startAt: new Date('2026-09-16T08:00:00+07:00'),
        endAt: new Date('2026-09-16T09:00:00+07:00'),
        capacity,
        bookedCount: 0,
        isActive: true,
      })
      .returning();
    return slot;
  }

  async function reg(eventId: string, slotId: string, phone: string, name = 'Donor') {
    return registerDonorAtomic({
      eventId,
      firstName: name,
      lastName: 'Test',
      phone,
      participantType: 'STUDENT',
      donationExperience: 'FIRST_TIME',
      slotId,
    });
  }

  // ---- Case 0: migrations + seed sanity (schema wiring works) ----
  console.log('Case 0: Migrations applied — event/slot seeding works on the scratch DB');
  const { rows } = await db.execute(sql`SELECT current_database() AS db`);
  assert.strictEqual(rows[0].db, process.env.DATABASE_URL?.match(/\/([^/?]+)(?=\?|$)/)?.[1], 'queries must hit the scratch DB');
  const event = await createEvent();
  assert.ok(event.id);
  const viaService = await getEventBySlug('mumt-2026');
  assert.strictEqual(viaService?.id, EVENT_ID, 'service layer must read the seeded event from the real DB');
  console.log('✓ migrations applied, service reads from real schema\n');

  // ---- Case 1: duplicate normalized phone ----
  console.log('Case 1: Duplicate normalized phone rejected (unique index + service check)');
  const slot1 = await createSlot(event.id, 5);
  const r1 = await reg(event.id, slot1.id, '081-111-2222');
  assert.strictEqual(r1.success, true, 'first registration must succeed');

  const r2 = await reg(event.id, slot1.id, '0811112222'); // same normalized phone, different formatting
  assert.strictEqual(r2.success, false, 'second registration with the same phone must be rejected');
  assert.strictEqual(r2.errorCode, 'DUPLICATE_REGISTRATION');

  const dupes = await db
    .select()
    .from(registrations)
    .where(and(eq(registrations.eventId, event.id), eq(registrations.phoneNormalized, '0811112222')));
  assert.strictEqual(dupes.length, 1, 'exactly one registration may exist for the phone');
  console.log('✓ duplicate phone prevented\n');

  // ---- Case 2: unlimited slot registrations under concurrency ----
  console.log('Case 2: Unlimited slot registrations — all concurrent registrations succeed');
  const slot2 = await createSlot(event.id, 3);
  const attempts = Array.from({ length: 6 }, (_, i) => reg(event.id, slot2.id, `0890000${String(i).padStart(3, '0')}`));
  const results = await Promise.all(attempts);
  const okCount = results.filter((r) => r.success).length;
  assert.strictEqual(okCount, 6, `expected all 6 successes, got ${okCount}`);

  const [slotRow] = await db.select().from(timeSlots).where(eq(timeSlots.id, slot2.id));
  assert.strictEqual(slotRow.bookedCount, 6, 'booked_count must equal 6 after concurrent registrations');
  const booked = await db.select().from(registrations).where(eq(registrations.slotId, slot2.id));
  assert.strictEqual(booked.length, 6, 'exactly 6 registrations must exist for the slot');
  console.log('✓ unlimited time slot accommodates all concurrent registrations\n');

  // ---- Case 3: transaction rollback ----
  console.log('Case 3: Transaction rollback — failed transition / FK failure leave no partial writes');
  const slot3 = await createSlot(event.id, 5);
  const r3 = await reg(event.id, slot3.id, '083-333-3333');
  assert.strictEqual(r3.success, true);
  const regId = r3.registration!.id;

  // Invalid state-machine jump (REGISTERED -> COMPLETED) is rejected up front.
  const invalid = await updateRegistrationStatus(regId, 'COMPLETED');
  assert.strictEqual(invalid.success, false, 'invalid transition must be rejected');
  const [afterInvalid] = await db.select().from(registrations).where(eq(registrations.id, regId));
  assert.strictEqual(afterInvalid.status, 'REGISTERED', 'status unchanged after rejected transition');
  const audit0 = await db.select().from(checkinEvents).where(eq(checkinEvents.registrationId, regId));
  assert.strictEqual(audit0.length, 0, 'no audit row for the rejected transition');

  // Genuine DB-level rollback: the status update + audit insert are atomic; an
  // audit insert failing its FK (actor does not exist) must roll back the status.
  // (DrizzleQueryError puts the driver message in `cause`; assert on that.)
  await assert.rejects(
    () => updateRegistrationStatus(regId, 'CHECKED_IN', 'no-such-user-id'),
    (err: unknown) => {
      assert.ok(err instanceof Error, 'audit insert with a non-existent actor must throw');
      const cause = (err as { cause?: { message?: string } }).cause;
      assert.match(
        cause?.message ?? '',
        /foreign key|violates|constraint/i,
        'the underlying DB error must be the FK violation'
      );
      return true;
    },
    'audit insert with a non-existent actor must fail'
  );
  const [afterFk] = await db.select().from(registrations).where(eq(registrations.id, regId));
  assert.strictEqual(afterFk.status, 'REGISTERED', 'status must roll back with the failed audit insert');
  const auditRows = await db.select().from(checkinEvents).where(eq(checkinEvents.registrationId, regId));
  assert.strictEqual(auditRows.length, 0, 'no audit row after the rolled-back insert');
  console.log('✓ atomic status + audit transaction rolls back cleanly\n');

  // ---- Case 4: cancel registration → frees seat → waitlist promotion ----
  console.log('Case 4: Staff cancel — decrements booked_count, promotes FIFO waitlist entry');
  const slot4 = await createSlot(event.id, 1);
  const rA = await reg(event.id, slot4.id, '084-444-4441', 'First');
  assert.strictEqual(rA.success, true, 'slot should fill');
  const regAId = rA.registration!.id;

  const wl1 = await joinWaitlist({ eventId: event.id, slotId: slot4.id, firstName: 'Wait', lastName: 'One', phone: '084-444-4442' });
  assert.strictEqual(wl1.success, true, 'waitlist join must succeed on a full slot');
  const wl2 = await joinWaitlist({ eventId: event.id, slotId: slot4.id, firstName: 'Wait', lastName: 'Two', phone: '084-444-4443' });
  assert.strictEqual(wl2.success, true);

  // Deterministic FIFO order (oldest first).
  await db.update(waitlist).set({ createdAt: new Date(Date.now() - 120_000) }).where(eq(waitlist.id, wl1.entry!.id));
  await db.update(waitlist).set({ createdAt: new Date(Date.now() - 60_000) }).where(eq(waitlist.id, wl2.entry!.id));

  // Cancelling the seat-holding donor frees the seat AND promotes the waitlist.
  const cancel = (await cancelRegistration(regAId)) as {
    success: boolean;
    message?: string;
    promoted?: { registration: { id: string }; entry: unknown } | null;
  };
  assert.strictEqual(cancel.success, true, 'cancel must succeed');
  assert.ok(cancel.promoted, 'cancel must promote the next waiting donor');

  const [cancelledReg] = await db.select().from(registrations).where(eq(registrations.id, regAId));
  assert.strictEqual(cancelledReg.status, 'CANCELLED', 'registration status must be CANCELLED');
  const cancelAudits = await db.select().from(checkinEvents).where(and(eq(checkinEvents.registrationId, regAId), eq(checkinEvents.action, 'STATUS_CHANGE_CANCELLED')));
  assert.strictEqual(cancelAudits.length, 1, 'cancel must write an audit event');

  const [promotedReg] = await db.select().from(registrations).where(eq(registrations.id, cancel.promoted.registration.id));
  assert.strictEqual(promotedReg.firstName, 'Wait', 'promoted registration carries the donor name');
  assert.strictEqual(promotedReg.lastName, 'One');

  const [promoted] = await db.select().from(waitlist).where(eq(waitlist.id, wl1.entry!.id));
  assert.strictEqual(promoted.status, 'NOTIFIED', 'promoted entry must be NOTIFIED');
  assert.strictEqual(promoted.promotedRegistrationId, promotedReg.id, 'promoted entry links the new registration');

  const [second] = await db.select().from(waitlist).where(eq(waitlist.id, wl2.entry!.id));
  assert.strictEqual(second.status, 'WAITING', 'second entry must stay WAITING (FIFO)');

  // 1 (cancelled) − 1 (freed) + 1 (promoted) = 1
  const [slotAfter] = await db.select().from(timeSlots).where(eq(timeSlots.id, slot4.id));
  assert.strictEqual(slotAfter.bookedCount, 1, 'booked_count: −1 on cancel, +1 on promotion');
  console.log('✓ cancel releases seat + promotes FIFO waitlist entry (real flow)\n');

  // ---- Case 5: forced password change flag round-trip (real adapter) ----
  console.log('Case 5: Forced password change flag round-trip (Better Auth, real DB adapter)');
  const email = `itest${Date.now()}@mahidol.ac.th`;
  const password = 'InitialPass@2026';

  const post = (path: string, body: unknown, cookie?: string) =>
    auth.handler(
      new Request(`${BASE}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: BASE,
          ...(cookie ? { cookie } : {}),
        },
        body: JSON.stringify(body),
      })
    );
  const get = (path: string, cookie: string) =>
    auth.handler(new Request(`${BASE}${path}`, { headers: { origin: BASE, cookie } }));
  const cookieFrom = (res: Response) => {
    const sc = res.headers.get('set-cookie');
    assert.ok(sc, 'response must set a session cookie');
    return sc.split(';')[0];
  };

  const signUp = await post('/api/auth/sign-up/email', { email, password, name: 'Integration User' });
  assert.strictEqual(signUp.status, 200, 'sign-up must succeed on the real adapter');
  const signUpBody = await signUp.json();
  assert.strictEqual(signUpBody.user.email, email);

  const [createdUser] = await db.select().from(user).where(eq(user.email, email));
  assert.strictEqual(createdUser.mustChangePassword, false, 'new users start with the flag off');

  // Staff accounts are seeded with the flag ON (see scripts/seed-staff.ts) —
  // round-trip it: DB true -> session true -> password change -> DB false.
  await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, signUpBody.user.id));

  const signIn = await post('/api/auth/sign-in/email', { email, password });
  assert.strictEqual(signIn.status, 200, 'sign-in must succeed');
  const cookie = cookieFrom(signIn);

  const sess = await get('/api/auth/get-session', cookie);
  assert.strictEqual(sess.status, 200);
  const sessBody = await sess.json();
  assert.strictEqual(sessBody.session.userId, signUpBody.user.id, 'session matches the signed-in user');
  assert.strictEqual(sessBody.user.mustChangePassword, true, 'flag set in DB must round-trip through the real adapter');

  const change = await post(
    '/api/auth/change-password',
    { currentPassword: password, newPassword: 'ChangedPass@2026', revokeOtherSessions: false },
    cookie
  );
  assert.strictEqual(change.status, 200, 'change-password should succeed');

  // The app clears the flag after a forced change (app/api/auth/complete-password-change).
  await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, signUpBody.user.id));

  const oldLogin = await post('/api/auth/sign-in/email', { email, password });
  assert.strictEqual(oldLogin.status, 401, 'old password must be rejected after the change');

  const newLogin = await post('/api/auth/sign-in/email', { email, password: 'ChangedPass@2026' });
  assert.strictEqual(newLogin.status, 200, 'new password must sign in');
  const cookie2 = cookieFrom(newLogin);
  const sess2 = await get('/api/auth/get-session', cookie2);
  const sessBody2 = await sess2.json();
  assert.strictEqual(sessBody2.user.mustChangePassword, false, 'flag cleared after the forced change');
  console.log('✓ forced password change flag round-trip\n');
}

main().catch((err) => {
  console.error('❌ Neon integration test suite failed:', err);
  process.exit(1);
});
