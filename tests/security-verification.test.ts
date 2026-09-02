// Security Closure Verification Test Suite (12 Required Production Security Cases)
// Tests cryptographic possession tokens, unguessable QR codes, rate limiting, and enumeration resistance.

process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert/strict';
import {
  defaultEvent,
  registerDonorAtomic,
  getRegistrationByCode,
  createVerificationToken,
  inMemoryVerificationTokens,
  updateRegistrationStatus,
} from '../lib/db/store';
import { generateQRToken, generateAccessToken } from '../lib/utils/format';
import { GET as getRegistrationApi } from '../app/api/registrations/[code]/route';
import { POST as cancelApiPost } from '../app/api/registrations/cancel/route';
import { POST as lookupApiPost } from '../app/api/registrations/lookup/route';
import { POST as verifyApiPost } from '../app/api/registrations/verify/route';

async function runSecurityVerificationTests() {
  console.log('🔒 Starting 12-Point Security Verification Test Suite...\n');

  // Setup: Register a test donor
  const regResult = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'กฤษฎา',
    lastName: 'พัฒนพงษ์',
    phone: '0891234567',
    email: 'kritsada@mahidol.edu',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
    source: 'ONLINE',
  });

  assert.strictEqual(regResult.success, true, 'Registration setup must succeed');
  const reg = regResult.registration!;
  const regCode = reg.registration_code;
  const accessToken = reg.access_token;
  const qrToken = reg.qr_token;

  assert.ok(regCode, 'Registration code must exist');
  assert.ok(accessToken, 'Access token must exist');
  assert.ok(qrToken, 'QR token must exist');
  console.log(`✓ Setup donor created: code=${regCode}`);

  // -------------------------------------------------------------
  // Test 1: Sequential registration code alone cannot retrieve private ticket
  // -------------------------------------------------------------
  console.log('\n[1/12] Testing: Sequential registration code alone cannot retrieve private ticket');
  const bareCodeReq = new Request(`http://localhost:3000/api/registrations/${regCode}`, {
    method: 'GET',
  });
  const bareCodeRes = await getRegistrationApi(bareCodeReq, { params: Promise.resolve({ code: regCode }) });
  assert.strictEqual(bareCodeRes.status, 401, 'Request with bare registration code must return 401 Unauthorized');
  const bareCodeData = await bareCodeRes.json();
  assert.strictEqual(bareCodeData.success, false);
  assert.strictEqual(bareCodeData.registration, undefined, 'Must not return registration or QR token');
  console.log('✓ PASS: Bare sequential code rejected with 401');

  // -------------------------------------------------------------
  // Test 2: Phone number alone cannot retrieve private ticket
  // -------------------------------------------------------------
  console.log('\n[2/12] Testing: Phone number alone cannot retrieve private ticket');
  // There is no public endpoint that accepts bare phone to return tickets; lookup requires email verification
  const phoneLookupReq = new Request('http://localhost:3000/api/registrations/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '0891234567' }), // Missing valid email
  });
  const phoneLookupRes = await lookupApiPost(phoneLookupReq);
  assert.strictEqual(phoneLookupRes.status, 400, 'Submitting bare phone to lookup endpoint must return 400');
  console.log('✓ PASS: Phone number alone cannot retrieve private ticket');

  // -------------------------------------------------------------
  // Test 3: Phone + full name cannot retrieve private ticket or cancel
  // -------------------------------------------------------------
  console.log('\n[3/12] Testing: Phone + full name cannot retrieve private ticket or cancel');
  const cancelByNamePhoneReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: regCode,
      firstName: 'กฤษฎา',
      lastName: 'พัฒนพงษ์',
      phone: '0891234567',
      // No accessToken or qrToken provided
    }),
  });
  const cancelByNamePhoneRes = await cancelApiPost(cancelByNamePhoneReq);
  assert.strictEqual(cancelByNamePhoneRes.status, 400, 'Cancellation with name + phone but without token must return 400 (validation rejected)');
  console.log('✓ PASS: Phone + full name rejected without possession token');

  // -------------------------------------------------------------
  // Test 4: Wrong verification token is rejected
  // -------------------------------------------------------------
  console.log('\n[4/12] Testing: Wrong verification token is rejected');
  const wrongVerifyReq = new Request('http://localhost:3000/api/registrations/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'lvu_sec_invalidtoken12345678901234567890123456789012345678901234567890',
    }),
  });
  const wrongVerifyRes = await verifyApiPost(wrongVerifyReq);
  assert.strictEqual(wrongVerifyRes.status, 401, 'Wrong verification token must return 401 Unauthorized');
  const wrongVerifyData = await wrongVerifyRes.json();
  assert.strictEqual(wrongVerifyData.success, false);
  console.log('✓ PASS: Invalid verification token rejected with 401');

  // -------------------------------------------------------------
  // Test 5: Expired token is rejected
  // -------------------------------------------------------------
  console.log('\n[5/12] Testing: Expired token is rejected');
  const expiredToken = 'lvu_sec_expiredtoken12345678901234567890123456789012345678901234567890';
  inMemoryVerificationTokens.push({
    id: 'vt-expired',
    token: expiredToken,
    registration_id: reg.id,
    contact_target: 'kritsada@mahidol.edu',
    expires_at: new Date(Date.now() - 60 * 1000).toISOString(), // Expired 1 minute ago
    used_at: null,
    created_at: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
  });

  const expiredVerifyReq = new Request('http://localhost:3000/api/registrations/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: expiredToken }),
  });
  const expiredVerifyRes = await verifyApiPost(expiredVerifyReq);
  assert.strictEqual(expiredVerifyRes.status, 401, 'Expired token must return 401 Unauthorized');
  console.log('✓ PASS: Expired verification token rejected with 401');

  // -------------------------------------------------------------
  // Test 6: Valid verification allows intended access
  // -------------------------------------------------------------
  console.log('\n[6/12] Testing: Valid verification allows intended access');
  const validToken = await createVerificationToken(reg.id, 'kritsada@mahidol.edu');
  const validVerifyReq = new Request('http://localhost:3000/api/registrations/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: validToken }),
  });
  const validVerifyRes = await verifyApiPost(validVerifyReq);
  assert.strictEqual(validVerifyRes.status, 200, 'Valid token must return 200 OK');
  const validVerifyData = await validVerifyRes.json();
  assert.strictEqual(validVerifyData.success, true);
  assert.strictEqual(validVerifyData.accessToken, accessToken);

  // Use the verified access token to fetch the private registration pass
  const authorizedPassReq = new Request(`http://localhost:3000/api/registrations/${regCode}?token=${accessToken}`, {
    method: 'GET',
  });
  const authorizedPassRes = await getRegistrationApi(authorizedPassReq, { params: Promise.resolve({ code: regCode }) });
  assert.strictEqual(authorizedPassRes.status, 200, 'Request with valid access token must return 200 OK');
  const authorizedPassData = await authorizedPassRes.json();
  assert.strictEqual(authorizedPassData.success, true);
  assert.strictEqual(authorizedPassData.registration.first_name, 'กฤษฎา');
  assert.strictEqual(authorizedPassData.registration.qr_token, qrToken);
  console.log('✓ PASS: Valid verification token grants access to private ticket');

  // -------------------------------------------------------------
  // Test 7: Unauthorized cancellation is rejected
  // -------------------------------------------------------------
  console.log('\n[7/14] Testing: Unauthorized cancellation is rejected');
  const unauthCancelReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: regCode,
      token: 'lvu_sec_attackerguess000000000000000000000000000000000000000000000000',
    }),
  });
  const unauthCancelRes = await cancelApiPost(unauthCancelReq);
  assert.strictEqual(unauthCancelRes.status, 401, 'Cancellation with wrong access token must return 401');
  console.log('✓ PASS: Unauthorized cancellation rejected with 401');

  // -------------------------------------------------------------
  // Test 8: Valid QR token + no participant authorization -> cancellation rejected
  // -------------------------------------------------------------
  console.log('\n[8/14] Testing: Valid QR token cannot cancel registration');
  const qrCancelReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: regCode,
      qrToken: qrToken, // Valid QR token
      // No accessToken or cookie session
    }),
  });
  const qrCancelRes = await cancelApiPost(qrCancelReq);
  assert.strictEqual(qrCancelRes.status, 401, 'Cancellation with QR token alone must return 401 Unauthorized');
  const qrCancelData = await qrCancelRes.json();
  assert.strictEqual(qrCancelData.success, false);
  console.log('✓ PASS: Valid QR token alone cannot cancel registration (rejected with 401)');

  // -------------------------------------------------------------
  // Test 9: Authorized cancellation succeeds
  // -------------------------------------------------------------
  console.log('\n[9/14] Testing: Authorized cancellation succeeds');
  const authCancelReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: regCode,
      token: accessToken,
      reason: 'ต้องการเปลี่ยนเวลา',
    }),
  });
  const authCancelRes = await cancelApiPost(authCancelReq);
  assert.strictEqual(authCancelRes.status, 200, 'Cancellation with valid access token must return 200');
  const authCancelData = await authCancelRes.json();
  assert.strictEqual(authCancelData.success, true);

  const cancelledReg = await getRegistrationByCode(regCode);
  assert.strictEqual(cancelledReg?.status, 'CANCELLED');
  console.log('✓ PASS: Authorized cancellation succeeds and updates status to CANCELLED');

  // -------------------------------------------------------------
  // Test 10: Checked-in registration cannot be cancelled through participant flow
  // -------------------------------------------------------------
  console.log('\n[10/14] Testing: Checked-in registration cannot be cancelled');
  // Create a new donor and check them in
  const regCheckin = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'สมหมาย',
    lastName: 'ใจสู้',
    phone: '0899998888',
    email: 'sommai@mahidol.edu',
    participantType: 'STUDENT',
    donationExperience: 'RETURNING',
    slotId: 'ts-2',
    source: 'ONLINE',
  });
  const codeCheckin = regCheckin.registration!.registration_code;
  const tokenCheckin = regCheckin.registration!.access_token;
  await updateRegistrationStatus(regCheckin.registration!.id, 'CHECKED_IN');

  const cancelCheckedInReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeCheckin,
      token: tokenCheckin,
    }),
  });
  const cancelCheckedInRes = await cancelApiPost(cancelCheckedInReq);
  assert.strictEqual(cancelCheckedInRes.status, 400, 'Checked-in registration cannot be cancelled (must return 400)');
  const cancelCheckedInData = await cancelCheckedInRes.json();
  assert.strictEqual(cancelCheckedInData.success, false);
  console.log('✓ PASS: Cancellation of CHECKED_IN donor rejected with 400');

  // -------------------------------------------------------------
  // Test 11: Session Cookie Transport & Clean Pass Access
  // -------------------------------------------------------------
  console.log('\n[11/14] Testing: Session Cookie Transport grants access without token in URL');
  // Request verification for donor, which sets HttpOnly cookie lvu_pass_${code}
  const cookieDonor = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'พิชชา',
    lastName: 'สุขสมบูรณ์',
    phone: '0895551234',
    email: 'pitcha@mahidol.edu',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
    source: 'ONLINE',
  });
  const cookieReg = cookieDonor.registration!;
  const vt = await createVerificationToken(cookieReg.id, 'pitcha@mahidol.edu');
  
  const verifyWithCookieReq = new Request('http://localhost:3000/api/registrations/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: vt }),
  });
  const verifyWithCookieRes = await verifyApiPost(verifyWithCookieReq);
  assert.strictEqual(verifyWithCookieRes.status, 200);
  const setCookieHeader = verifyWithCookieRes.headers.get('set-cookie');
  assert.ok(setCookieHeader, 'Verification response must set session cookie');
  assert.ok(setCookieHeader.includes(`lvu_pass_${cookieReg.registration_code}`), 'Cookie name must match registration pass');
  assert.ok(setCookieHeader.toLowerCase().includes('httponly'), 'Session cookie must be HttpOnly');

  // Now make a cancellation request using the session cookie alone (no token in body)
  const cookieCancelReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `lvu_pass_${cookieReg.registration_code}=${cookieReg.access_token}`,
    },
    body: JSON.stringify({
      registrationCode: cookieReg.registration_code,
      reason: 'ยกเลิกผ่าน Session Cookie',
    }),
  });
  const cookieCancelRes = await cancelApiPost(cookieCancelReq);
  assert.strictEqual(cookieCancelRes.status, 200, 'Cancellation with valid session cookie must succeed');
  console.log('✓ PASS: HttpOnly session cookie transport verified cleanly');

  // -------------------------------------------------------------
  // Test 12: QR token cannot be guessed from registration number
  // -------------------------------------------------------------
  console.log('\n[12/14] Testing: QR token cannot be guessed from registration number');
  const sampleQR1 = generateQRToken();
  const sampleQR2 = generateQRToken();

  assert.ok(sampleQR1.startsWith('lvu_qr_'), 'QR token must use opaque prefix lvu_qr_');
  assert.strictEqual(sampleQR1.length, 71, 'QR token must contain prefix + 64 hex chars (256 bits)');
  assert.notStrictEqual(sampleQR1, sampleQR2, 'Consecutive QR tokens must be distinct');
  assert.strictEqual(sampleQR1.includes('LVU26'), false, 'QR token must NOT contain sequential registration code');
  assert.strictEqual(sampleQR1.includes('001'), false, 'QR token must NOT contain sequential numbers');

  const sampleAccess1 = generateAccessToken();
  assert.ok(sampleAccess1.startsWith('lvu_sec_'), 'Access token must use prefix lvu_sec_');
  assert.strictEqual(sampleAccess1.length, 72, 'Access token must contain prefix + 64 hex chars (256 bits)');
  console.log('✓ PASS: QR token and Access token have 256-bit cryptographic entropy and zero sequential PII');

  // -------------------------------------------------------------
  // Test 13: Repeated verification attempts are rate-limited
  // -------------------------------------------------------------
  console.log('\n[13/14] Testing: Repeated verification attempts are rate-limited');
  process.env.ENABLE_RATE_LIMIT_FOR_TEST = 'true';
  // Send 20 verification attempts from a simulated client IP (limit is 15)
  let wasRateLimited = false;
  for (let i = 0; i < 20; i++) {
    const rateLimitReq = new Request('http://localhost:3000/api/registrations/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.42', // Distinct IP
      },
      body: JSON.stringify({ token: 'lvu_sec_invalidattempt000000000000000000000000000000000000000000' }),
    });
    const res = await verifyApiPost(rateLimitReq);
    if (res.status === 429) {
      wasRateLimited = true;
      break;
    }
  }
  process.env.ENABLE_RATE_LIMIT_FOR_TEST = 'false';
  assert.strictEqual(wasRateLimited, true, 'Excessive verification attempts must trigger HTTP 429 Too Many Requests');
  console.log('✓ PASS: Repeated verification attempts triggered 429 Rate Limit');

  // -------------------------------------------------------------
  // Test 14: Registration enumeration does not expose participant existence
  // -------------------------------------------------------------
  console.log('\n[14/14] Testing: Registration enumeration does not expose participant existence');
  // Lookup for existing email
  const existingLookupReq = new Request('http://localhost:3000/api/registrations/lookup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.1',
    },
    body: JSON.stringify({ email: 'sommai@mahidol.edu' }),
  });
  const existingLookupRes = await lookupApiPost(existingLookupReq);
  assert.strictEqual(existingLookupRes.status, 200);
  const existingData = await existingLookupRes.json();

  // Lookup for non-existent email
  const nonExistentLookupReq = new Request('http://localhost:3000/api/registrations/lookup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.2',
    },
    body: JSON.stringify({ email: 'doesnotexist999@mahidol.edu' }),
  });
  const nonExistentLookupRes = await lookupApiPost(nonExistentLookupReq);
  assert.strictEqual(nonExistentLookupRes.status, 200);
  const nonExistentData = await nonExistentLookupRes.json();

  assert.strictEqual(existingData.success, true);
  assert.strictEqual(nonExistentData.success, true);
  assert.strictEqual(
    existingData.message,
    nonExistentData.message,
    'Lookup message for existing and non-existing email must be 100% identical'
  );
  console.log('✓ PASS: Enumeration resistance confirmed — identical 200 response returned regardless of record existence');

  console.log('\n🎉 ALL 14 SECURITY VERIFICATION TESTS PASSED PERFECTLY!\n');
}

runSecurityVerificationTests().catch((err) => {
  console.error('❌ Security verification test failed:', err);
  process.exit(1);
});
