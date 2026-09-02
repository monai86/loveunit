// Donor self-cancellation integration test suite:
//   - Tests public cancel endpoint logic & possession verification
//   - Verifies monotonic registration sequence progression
//   - Verifies immediate re-registration capability with identical phone

process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert/strict';
import {
  defaultEvent,
  registerDonorAtomic,
  getRegistrationByCode,
  isTransitionAllowed,
} from '../lib/db/store';
import { POST as cancelApiPost } from '../app/api/registrations/cancel/route';

async function runDonorSelfCancelTests() {
  console.log('🧪 Starting Donor Self-Cancellation Test Suite...\n');

  // ---- Test 1: Register initial donor ----
  console.log('Test 1: Register initial donor');
  const regA = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'ศุภกร',
    lastName: 'คนใจดี',
    phone: '0812345601',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
    source: 'ONLINE',
  });

  assert.strictEqual(regA.success, true, 'Initial registration must succeed');
  const codeA = regA.registration!.registration_code;
  const tokenA = regA.registration!.access_token;
  assert.ok(tokenA, 'Registration must return high-entropy access token');
  console.log(`✓ Registered donor A with code ${codeA} and access token`);

  // ---- Test 2: Security guard - Missing or wrong token cannot cancel registration ----
  console.log('Test 2: Security Check - Wrong or missing token is rejected');
  const wrongTokenReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeA,
      token: 'lvu_sec_wrongtoken00000000000000000000000000000000000000000000000000000000',
      reason: 'ทดสอบผิดโทเค็น',
    }),
  });

  const wrongTokenRes = await cancelApiPost(wrongTokenReq);
  assert.strictEqual(wrongTokenRes.status, 401, 'Wrong token must return 401 Unauthorized');
  const wrongTokenData = await wrongTokenRes.json();
  assert.strictEqual(wrongTokenData.success, false);
  console.log('✓ Wrong access token safely rejected with 401');

  // ---- Test 3: Successful donor self-cancellation via API with valid Access Token ----
  console.log('Test 3: Valid Access Token successfully cancels registration');
  const correctTokenReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeA,
      token: tokenA,
      reason: 'ติดภารกิจด่วน',
    }),
  });

  const correctTokenRes = await cancelApiPost(correctTokenReq);
  assert.strictEqual(correctTokenRes.status, 200, 'Valid cancellation must return 200 OK');
  const correctTokenData = await correctTokenRes.json();
  assert.strictEqual(correctTokenData.success, true);
  assert.strictEqual(correctTokenData.registrationCode, codeA);

  const updatedRegA = await getRegistrationByCode(codeA);
  assert.strictEqual(updatedRegA?.status, 'CANCELLED', 'Status must be updated to CANCELLED');
  console.log('✓ Donor A registration cancelled successfully with valid access token');

  // ---- Test 4: Cannot cancel an already cancelled registration ----
  console.log('Test 4: Cannot cancel already cancelled registration');
  const repeatCancelReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeA,
      token: tokenA,
    }),
  });
  const repeatCancelRes = await cancelApiPost(repeatCancelReq);
  assert.strictEqual(repeatCancelRes.status, 400, 'Repeat cancel must return 400');
  const repeatCancelData = await repeatCancelRes.json();
  assert.strictEqual(repeatCancelData.success, false);
  console.log('✓ Repeat cancellation rejected cleanly');

  // ---- Test 5: Cancelled code cannot be used for check-in ----
  console.log('Test 5: State machine prevents cancelled registration from check-in');
  assert.strictEqual(
    isTransitionAllowed('CANCELLED', 'CHECKED_IN'),
    false,
    'CANCELLED cannot transition to CHECKED_IN'
  );
  console.log('✓ Cancelled code cannot be checked in');

  // ---- Test 6: Re-registration with same phone succeeds with new monotonic code ----
  console.log('Test 6: Donor can immediately re-register with same phone and receive new sequential code');
  const regARe = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'ศุภกร',
    lastName: 'คนใจดี',
    phone: '0812345601', // Same phone number!
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-2', // Different time slot
    source: 'ONLINE',
  });

  assert.strictEqual(regARe.success, true, 'Re-registration after cancellation must succeed');
  const codeARe = regARe.registration!.registration_code;
  assert.notStrictEqual(codeARe, codeA, 'New registration must receive a fresh code');
  
  // Extract number parts to verify sequence is greater
  const seqOld = parseInt(codeA.replace('LVU26-', ''), 10);
  const seqNew = parseInt(codeARe.replace('LVU26-', ''), 10);
  assert.ok(seqNew > seqOld, `New code sequence (${seqNew}) must be strictly greater than cancelled sequence (${seqOld})`);
  console.log(`✓ Donor re-registered successfully: Previous=${codeA}, New=${codeARe}`);

  // ---- Test 7: Another new donor receives strictly next sequential code ----
  console.log('Test 7: Subsequent new donor receives next sequential code');
  const regB = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'วิภาดา',
    lastName: 'รักการให้',
    phone: '0812345602',
    participantType: 'STAFF',
    donationExperience: 'RETURNING',
    slotId: 'ts-3',
    source: 'ONLINE',
  });

  assert.strictEqual(regB.success, true);
  const codeB = regB.registration!.registration_code;
  const seqB = parseInt(codeB.replace('LVU26-', ''), 10);
  assert.strictEqual(seqB, seqNew + 1, 'Next registration code must continue monotonically without rollback');
  console.log(`✓ Subsequent donor B received code ${codeB} (monotonic sequence preserved)`);

  console.log('\n🎉 ALL DONOR SELF-CANCELLATION TESTS PASSED SUCCESSFULLY!');
}

runDonorSelfCancelTests().catch((err) => {
  console.error('❌ Donor self-cancel tests failed:', err);
  process.exit(1);
});
