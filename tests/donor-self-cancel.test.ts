// Donor self-cancellation integration test suite:
//   - Tests public cancel endpoint logic & security verification
//   - Verifies monotonic registration sequence progression
//   - Verifies immediate re-registration capability with identical phone

process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert/strict';
import {
  defaultEvent,
  inMemoryRegistrations,
  registerDonorAtomic,
  getRegistrationByCode,
  isTransitionAllowed,
} from '../lib/db/store';
import { findRegistrationsByPhone } from '../services/registration-service';
import { cancelRegistration } from '../services/checkin-service';
import { POST as cancelApiPost } from '../app/api/registrations/cancel/route';

async function runDonorSelfCancelTests() {
  console.log('🧪 Starting Donor Self-Cancellation Test Suite...\n');

  // Clear or note starting count
  const initialRegCount = inMemoryRegistrations.length;

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
  console.log(`✓ Registered donor A with code ${codeA}`);

  // ---- Test 2: Security guard - Wrong phone number cannot cancel registration ----
  console.log('Test 2: Security Check - Wrong phone number is rejected');
  const wrongPhoneReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeA,
      phone: '0899999999', // Different phone
      reason: 'ทดสอบผิดเบอร์',
    }),
  });

  const wrongPhoneRes = await cancelApiPost(wrongPhoneReq);
  assert.strictEqual(wrongPhoneRes.status, 403, 'Wrong phone number must return 403 Forbidden');
  const wrongPhoneData = await wrongPhoneRes.json();
  assert.strictEqual(wrongPhoneData.success, false);
  assert.match(wrongPhoneData.message, /เบอร์โทรศัพท์ไม่ตรง/);
  console.log('✓ Wrong phone number safely rejected with 403');

  // ---- Test 3: Successful donor self-cancellation via API ----
  console.log('Test 3: Correct phone number successfully cancels registration');
  const correctPhoneReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeA,
      phone: '0812345601',
      reason: 'ติดภารกิจด่วน',
    }),
  });

  const correctPhoneRes = await cancelApiPost(correctPhoneReq);
  assert.strictEqual(correctPhoneRes.status, 200, 'Valid cancellation must return 200 OK');
  const correctPhoneData = await correctPhoneRes.json();
  assert.strictEqual(correctPhoneData.success, true);
  assert.strictEqual(correctPhoneData.registrationCode, codeA);

  const updatedRegA = await getRegistrationByCode(codeA);
  assert.strictEqual(updatedRegA?.status, 'CANCELLED', 'Status must be updated to CANCELLED');
  console.log('✓ Donor A registration cancelled successfully via public API');

  // ---- Test 4: Cannot cancel an already cancelled registration ----
  console.log('Test 4: Cannot cancel already cancelled registration');
  const repeatCancelReq = new Request('http://localhost:3000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationCode: codeA,
      phone: '0812345601',
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
    donationExperience: 'REPEAT',
    slotId: 'ts-3',
    source: 'ONLINE',
  });

  assert.strictEqual(regB.success, true);
  const codeB = regB.registration!.registration_code;
  const seqB = parseInt(codeB.replace('LVU26-', ''), 10);
  assert.strictEqual(seqB, seqNew + 1, 'Next registration code must continue monotonically without rollback');
  console.log(`✓ Subsequent donor B received code ${codeB} (monotonic sequence preserved)`);

  // ---- Test 8: Phone lookup returns only active registration ----
  console.log('Test 8: Phone lookup returns only active registration');
  const lookupActive = await findRegistrationsByPhone({
    eventId: defaultEvent.id,
    phone: '0812345601',
  });
  assert.strictEqual(lookupActive.length, 1, 'Lookup must return 1 active registration for this phone');
  assert.strictEqual(lookupActive[0].registration_code, codeARe, 'Lookup must return the new active code');
  console.log('✓ Lookup correctly returns only active registration');

  console.log('\n🎉 ALL DONOR SELF-CANCELLATION TESTS PASSED SUCCESSFULLY!');
}

runDonorSelfCancelTests().catch((err) => {
  console.error('❌ Donor self-cancel tests failed:', err);
  process.exit(1);
});
