// Auth integration tests — run against Better Auth with the in-memory adapter
// (no database needed, works in CI). Requests go through auth.handler() so the
// full HTTP flow (cookies, CSRF origin checks, session rotation) is exercised.
// Also covers the RBAC server guards with injected users.
process.env.DATA_BACKEND = 'memory';
// @ts-expect-error NODE_ENV is typed read-only but tests need to force test mode
process.env['NODE_ENV'] = 'test';

import assert from 'node:assert';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import {
  requireStaff,
  requireAdmin,
  requireTeamLead,
  requireSuperAdmin,
} from '../lib/auth/server';
import type { AuthenticatedUser } from '../lib/auth/server';

const BASE = 'http://localhost:3000';

function makeUser(role: 'ADMIN' = 'ADMIN', overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: `u-${role.toLowerCase()}-test`,
    email: `${role.toLowerCase()}@test.local`,
    profile: {
      user_id: `u-${role.toLowerCase()}-test`,
      display_name: role,
      role,
      team: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    mustChangePassword: false,
    ...overrides,
  };
}

async function runAuthTests() {
  console.log('🔐 Running Auth Integration Test Suite...\n');

  const db: Record<string, unknown[]> = { user: [], session: [], account: [], verification: [] };
  const auth = betterAuth({
    database: memoryAdapter(db),
    emailAndPassword: { enabled: true },
    secret: 'test-secret-1234567890-abcdefghijklmnop',
    baseURL: BASE,
  });

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

  const get = (path: string, cookie?: string) =>
    auth.handler(
      new Request(`${BASE}${path}`, {
        headers: { origin: BASE, ...(cookie ? { cookie } : {}) },
      })
    );

  const cookieFrom = (res: Response) => {
    const sc = res.headers.get('set-cookie');
    assert.ok(sc, 'response must set a cookie');
    return sc.split(';')[0];
  };

  // Test 1: sign-up creates a user
  console.log('Test 1: Email/Password Sign-Up');
  const email = 'newadmin@mahidol.ac.th';
  const password = 'InitialPass@2026';
  const signUp = await post('/api/auth/sign-up/email', { email, password, name: 'ผู้ดูแลระบบใหม่' });
  assert.strictEqual(signUp.status, 200);
  const signUpBody = await signUp.json();
  assert.strictEqual(signUpBody.user.email, email);
  assert.strictEqual(signUpBody.user.name, 'ผู้ดูแลระบบใหม่');
  console.log('✓ Sign-up creates user\n');

  // Test 2: sign-in — correct password succeeds, wrong password fails
  console.log('Test 2: Email/Password Sign-In');
  const ok = await post('/api/auth/sign-in/email', { email, password });
  assert.strictEqual(ok.status, 200);
  const cookie = cookieFrom(ok);

  const bad = await post('/api/auth/sign-in/email', { email, password: 'WrongPass@999' });
  assert.strictEqual(bad.status, 401, 'wrong password must be rejected');
  console.log('✓ Correct password signs in, wrong password rejected\n');

  // Test 3: session is valid via the cookie, then change password
  console.log('Test 3: Session + Change Password');
  const sess = await get('/api/auth/get-session', cookie);
  assert.strictEqual(sess.status, 200);
  const sessBody = await sess.json();
  assert.strictEqual(sessBody.session.userId, signUpBody.user.id, 'session matches the signed-in user');

  const change = await post('/api/auth/change-password', { currentPassword: password, newPassword: 'ChangedPass@2026', revokeOtherSessions: false }, cookie);
  assert.strictEqual(change.status, 200, 'changePassword should succeed');

  const oldLogin = await post('/api/auth/sign-in/email', { email, password });
  assert.strictEqual(oldLogin.status, 401, 'old password must no longer work');

  const newLogin = await post('/api/auth/sign-in/email', { email, password: 'ChangedPass@2026' });
  assert.strictEqual(newLogin.status, 200, 'new password must sign in');
  console.log('✓ Password changed; old rejected, new accepted\n');

  // Test 4: sign-out revokes the session
  console.log('Test 4: Sign Out / Session Revocation');
  const newCookie = cookieFrom(newLogin);
  const out = await post('/api/auth/sign-out', {}, newCookie);
  assert.strictEqual(out.status, 200);

  const afterOut = await get('/api/auth/get-session', newCookie);
  assert.strictEqual(afterOut.status, 200);
  const afterOutText = await afterOut.text();
  assert.strictEqual(afterOutText, 'null', 'session must be gone after sign-out');
  console.log('✓ Session lifecycle verified\n');

  // ---- Server Guards for unified ADMIN role ----
  console.log('Test 5: Server Guards — requireStaff & requireAdmin');
  assert.ok(await requireStaff(makeUser('ADMIN')));
  assert.ok(await requireAdmin(makeUser('ADMIN')));
  assert.ok(await requireTeamLead(makeUser('ADMIN')));
  assert.ok(await requireSuperAdmin(makeUser('ADMIN')));
  await assert.rejects(() => requireStaff(null), /UNAUTHORIZED/, 'null user → 401');
  await assert.rejects(() => requireAdmin(null), /UNAUTHORIZED/, 'null user → 401');
  console.log('✓ All guards allow authenticated ADMIN, reject anonymous\n');

  // ---- Staff / Admin Management CRUD in Admin Service ----
  console.log('Test 6: Admin Management in Admin Service');
  const { getAllStaffMembers, updateStaffRoleAndTeam } = await import('../services/admin-service');
  const initialStaff = await getAllStaffMembers();
  assert.ok(initialStaff.length >= 1, 'Must have at least 1 seeded in-memory admin');
  const targetAdmin = initialStaff[0];

  const updateResult = await updateStaffRoleAndTeam({
    userId: targetAdmin.userId,
    role: 'ADMIN',
    team: 'Executive Operations',
    actorId: 'u-admin',
  });
  assert.strictEqual(updateResult.success, true);
  const updatedStaff = await getAllStaffMembers();
  const modifiedUser = updatedStaff.find((s) => s.userId === targetAdmin.userId);
  assert.strictEqual(modifiedUser?.role, 'ADMIN');
  assert.strictEqual(modifiedUser?.team, 'Executive Operations');
  console.log('✓ Admin update & team assignment verified\n');

  // ---- Public Footer Link Verification ----
  console.log('Test 7: Public Website Does Not Expose Staff Login Button');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const footerContent = fs.readFileSync(path.join(process.cwd(), 'components/layout/Footer.tsx'), 'utf-8');
  assert.ok(!footerContent.includes('เข้าสู่ระบบเจ้าหน้าที่ (Staff Login)'), 'Footer must not contain public staff login button');
  assert.ok(!footerContent.includes('href="/staff/login"'), 'Footer must not link to /staff/login publicly');
  console.log('✓ Public footer verified: staff login button removed from general public view\n');

  console.log('🎉 ALL AUTH & ADMIN ROLE TESTS PASSED SUCCESSFULLY!');
}

runAuthTests().catch((err) => {
  console.error('❌ Auth test suite failed:', err);
  process.exit(1);
});
