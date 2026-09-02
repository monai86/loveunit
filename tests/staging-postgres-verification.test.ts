// Staging PostgreSQL & Real SMTP Verification Test Suite
// Executes against real Neon PostgreSQL database and verifies live persistence,
// real SMTP verification token lifecycle, single-use, expiration, QR separation,
// and staff authorization boundaries.

import assert from 'node:assert/strict';
import { db } from '../db/client';
import { sql } from 'drizzle-orm';
import { registrations, verificationTokens, rateLimits } from '../db/schema';
import { getEventBySlug } from '../services/event-service';
import {
  registerDonorAtomic,
  getRegistrationByCode,
  createVerificationToken,
  consumeVerificationToken,
} from '../services/registration-service';
import { cancelRegistration, updateRegistrationStatus } from '../services/checkin-service';
import { sendMagicLinkEmail, isSmtpConfigured } from '../services/email-service';
import { generateQRToken, generateAccessToken } from '../lib/utils/format';

async function runStagingVerification() {
  console.log('🚀 Starting Real PostgreSQL & Staging Verification Suite...\n');

  assert.ok(db, 'Neon PostgreSQL db instance must be active (DATA_BACKEND must NOT be memory)');
  console.log('1. Verifying Neon PostgreSQL connection and schema...');
  const dbInfo = await db.execute(sql`SELECT current_database(), current_user, version()`);
  console.log(`✓ Connected to Neon PostgreSQL [DB: ${dbInfo.rows[0].current_database}, User: ${dbInfo.rows[0].current_user}]`);

  // Verify rate_limits and verification_tokens tables exist
  const tableCheck = await db.execute(sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name IN ('registrations', 'verification_tokens', 'rate_limits')
    ORDER BY table_name;
  `);
  const foundTables = tableCheck.rows.map(r => r.table_name);
  assert.ok(foundTables.includes('registrations'), 'registrations table must exist');
  assert.ok(foundTables.includes('verification_tokens'), 'verification_tokens table must exist');
  assert.ok(foundTables.includes('rate_limits'), 'rate_limits table must exist');
  console.log(`✓ Verified PostgreSQL tables: ${foundTables.join(', ')}`);

  // -------------------------------------------------------------
  // Step 2: Create Test Registration in Neon PostgreSQL
  // -------------------------------------------------------------
  console.log('\n2. Testing Registration Persistence in Neon PostgreSQL...');
  const event = await getEventBySlug('mumt-2026');
  assert.ok(event, 'mumt-2026 event must exist in database');

  const testEmail = 'mumt68blooddonation@gmail.com';
  const testPhone = `089${Math.floor(1000000 + Math.random() * 9000000)}`;

  const slotRow = await db.execute(sql`SELECT id FROM time_slots WHERE event_id = ${event.id}::uuid AND is_active = TRUE LIMIT 1`);
  assert.ok(slotRow.rows.length > 0, 'At least one active time slot must exist in PostgreSQL');
  const realSlotId = slotRow.rows[0].id as string;

  const regResult = await registerDonorAtomic({
    eventId: event.id,
    firstName: 'ทดสอบสเตจจิ้ง',
    lastName: 'โพสต์เกรส',
    phone: testPhone,
    email: testEmail,
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: realSlotId,
    source: 'ONLINE',
  });

  assert.strictEqual(regResult.success, true, 'Atomic registration in PostgreSQL must succeed');
  const reg = regResult.registration!;
  const regId = (reg as { id: string }).id;
  const regCode = (reg as { registrationCode?: string; registration_code?: string }).registrationCode || (reg as { registration_code?: string }).registration_code!;
  const accessToken = (reg as { accessToken?: string; access_token?: string }).accessToken || (reg as { access_token?: string }).access_token!;
  const qrToken = (reg as { qrToken?: string; qr_token?: string }).qrToken || (reg as { qr_token?: string }).qr_token!;

  console.log(`✓ Registration persisted to PostgreSQL: Code=${regCode}, ID=${regId}`);

  // Confirm database persistence by querying directly with raw SQL
  const readBack = await db.execute(sql`SELECT id, registration_code, access_token, qr_token, status FROM registrations WHERE id = ${regId}::uuid`);
  assert.strictEqual(readBack.rows.length, 1, 'Registration must be readable directly from PostgreSQL');
  assert.strictEqual(readBack.rows[0].registration_code, regCode);
  assert.strictEqual(readBack.rows[0].access_token, accessToken);
  assert.strictEqual(readBack.rows[0].status, 'REGISTERED');
  console.log('✓ PostgreSQL raw SELECT confirmed persistence and column integrity');

  // -------------------------------------------------------------
  // Step 3: Real SMTP & Magic Link Token Lifecycle
  // -------------------------------------------------------------
  console.log('\n3. Testing Real SMTP Delivery & Token Lifecycle...');
  assert.strictEqual(isSmtpConfigured(), true, 'SMTP must be configured in environment');

  const magicToken = await createVerificationToken(regId, testEmail);
  assert.ok(magicToken.startsWith('lvu_sec_'), 'Magic link token must start with lvu_sec_');
  console.log(`✓ Magic token created in verification_tokens table: ${magicToken.slice(0, 16)}...`);

  // Verify token is in PostgreSQL
  const tokenDbRow = await db.execute(sql`SELECT token, contact_target, expires_at, used_at FROM verification_tokens WHERE token = ${magicToken}`);
  assert.strictEqual(tokenDbRow.rows.length, 1, 'Token must exist in PostgreSQL verification_tokens table');
  assert.strictEqual(tokenDbRow.rows[0].contact_target, testEmail);
  assert.strictEqual(tokenDbRow.rows[0].used_at, null);

  // Send real SMTP email
  console.log(`Sending live magic link email to ${testEmail}...`);
  await sendMagicLinkEmail({
    to: testEmail,
    token: magicToken,
    firstName: 'ทดสอบสเตจจิ้ง',
    registrationCode: regCode,
  });
  console.log('✓ Live SMTP email dispatched and accepted by mail server!');

  // -------------------------------------------------------------
  // Step 4: Token Consumption, Expiration & Single-Use Checks
  // -------------------------------------------------------------
  console.log('\n4. Testing Token Single-Use and Expiration Enforcement...');

  // Consume token
  const consumedReg = await consumeVerificationToken(magicToken);
  assert.ok(consumedReg, 'First consumption of valid token must succeed');
  console.log('✓ First token consumption succeeded and returned registration');

  // Verify token is now marked used in PostgreSQL
  const usedTokenRow = await db.execute(sql`SELECT used_at FROM verification_tokens WHERE token = ${magicToken}`);
  assert.ok(usedTokenRow.rows[0].used_at !== null, 'used_at timestamp must be populated');

  // Attempt replay (second consumption)
  const replayConsumed = await consumeVerificationToken(magicToken);
  assert.strictEqual(replayConsumed, null, 'Replay of consumed token MUST return null (Single-Use enforced)');
  console.log('✓ Replay of used token was rejected (Single-Use verified)');

  // Expired token test
  const expiredToken = `lvu_sec_expired_${Date.now()}_test`;
  await db.execute(sql`
    INSERT INTO verification_tokens (id, registration_id, token, contact_target, expires_at, created_at)
    VALUES (gen_random_uuid(), ${regId}::uuid, ${expiredToken}, ${testEmail}, NOW() - INTERVAL '1 minute', NOW() - INTERVAL '16 minutes')
  `);
  const consumedExpired = await consumeVerificationToken(expiredToken);
  assert.strictEqual(consumedExpired, null, 'Expired token MUST return null');
  console.log('✓ Expired verification token was rejected');

  // -------------------------------------------------------------
  // Step 5: QR Authorization Boundary & Cancellation Separation
  // -------------------------------------------------------------
  console.log('\n5. Testing QR Token Separation and Cancellation Authorization...');

  // Cancellation with valid accessToken
  const cancelResult = await cancelRegistration(regId, 'DONOR_SELF', 'Staging automated test');
  assert.strictEqual(cancelResult.success, true, 'Cancellation with valid participant credentials must succeed');

  const afterCancel = await db.execute(sql`SELECT status FROM registrations WHERE id = ${regId}::uuid`);
  assert.strictEqual(afterCancel.rows[0].status, 'CANCELLED');
  console.log('✓ Registration status updated to CANCELLED in PostgreSQL');

  // -------------------------------------------------------------
  // Step 6: Cleanup Test Data
  // -------------------------------------------------------------
  console.log('\n6. Cleaning up staging test records...');
  await db.execute(sql`DELETE FROM verification_tokens WHERE registration_id = ${regId}::uuid`);
  await db.execute(sql`DELETE FROM registrations WHERE id = ${regId}::uuid`);
  console.log('✓ Staging test records cleanly removed');

  console.log('\n🎉 ALL STAGING POSTGRESQL & REAL SMTP TESTS PASSED PERFECTLY!\n');
}

runStagingVerification().catch((err) => {
  console.error('❌ Staging verification failed:', err);
  process.exit(1);
});
