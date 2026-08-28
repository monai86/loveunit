// Cancel-registration flow tests against the in-memory backend:
//   - cancelRegistration frees the slot seat (booked_count − 1) and promotes
//     the next WAITING waitlist donor (FIFO) into the freed seat.
//   - only state-machine-legal statuses can be cancelled (COMPLETED cannot).
process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert';
import {
  defaultEvent,
  defaultSlots,
  inMemoryRegistrations,
  registerDonorAtomic,
  updateRegistrationStatus,
  getInMemoryCheckinEvents,
} from '../lib/db/store';
import { cancelRegistration } from '../services/checkin-service';
import { deleteDonorRegistration } from '../services/admin-service';
import { joinWaitlist, inMemoryWaitlist } from '../services/waitlist-service';

async function runCancelTests() {
  console.log('🧪 Starting Cancel Flow Test Suite...\n');

  const slot1 = defaultSlots.find((s) => s.id === 'ts-1')!;
  const slot5 = defaultSlots.find((s) => s.id === 'ts-5')!;

  // ---- Test 1: cancel a REGISTERED registration frees the seat + audits ----
  console.log('Test 1: Cancel REGISTERED → CANCELLED, booked_count decremented, audit written');
  const before = slot1.booked_count;

  const regA = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'ยกเลิก',
    lastName: 'เทสต์',
    phone: '0900000001',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
  });
  assert.strictEqual(regA.success, true);
  const idA = regA.registration!.id;
  assert.strictEqual(slot1.booked_count, before + 1, 'registration increments booked_count');

  const res = await cancelRegistration(idA, 'u-staff', 'ผู้บริจาคขอเลื่อน');
  assert.strictEqual(res.success, true, 'cancel of REGISTERED must succeed');

  const updated = inMemoryRegistrations.find((r) => r.id === idA)!;
  assert.strictEqual(updated.status, 'CANCELLED', 'status must be CANCELLED');
  assert.strictEqual(slot1.booked_count, before, 'cancel decrements booked_count back');

  const audit = getInMemoryCheckinEvents().find((e) => e.registration_id === idA)!;
  assert.strictEqual(audit.action, 'STATUS_CHANGE_CANCELLED', 'cancel writes an audit event');
  assert.strictEqual(audit.metadata?.reason, 'ผู้บริจาคขอเลื่อน', 'cancel reason is recorded');
  console.log('✓ status → CANCELLED, booked_count restored, audit + reason recorded\n');

  // ---- Test 2: cancel promotes the next WAITING donor (FIFO) ----
  console.log('Test 2: Cancel promotes the next WAITING waitlist donor (FIFO)');
  const capacity = slot1.capacity;

  const regB = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'จอง',
    lastName: 'คิว',
    phone: '0900000004',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
  });
  assert.strictEqual(regB.success, true);
  const idB = regB.registration!.id;

  // Simulate a full slot so joinWaitlist accepts entries.
  slot1.booked_count = capacity;

  const wl1 = await joinWaitlist({ eventId: defaultEvent.id, slotId: 'ts-1', firstName: 'รอ', lastName: 'หนึ่ง', phone: '0900000002' });
  const wl2 = await joinWaitlist({ eventId: defaultEvent.id, slotId: 'ts-1', firstName: 'รอ', lastName: 'สอง', phone: '0900000003' });
  assert.strictEqual(wl1.success, true, 'waitlist join must succeed on a full slot');
  assert.strictEqual(wl2.success, true);

  const cancel2 = (await cancelRegistration(idB, 'u-lead')) as {
    success: boolean;
    promoted?: { registration: { id: string }; entry: unknown } | null;
  };
  assert.strictEqual(cancel2.success, true);
  assert.ok(cancel2.promoted, 'cancel must promote the next waiting donor');

  const promotedReg = inMemoryRegistrations.find((r) => r.id === cancel2.promoted!.registration.id)!;
  assert.strictEqual(promotedReg.first_name, 'รอ', 'promoted registration carries the first waiting donor');
  assert.strictEqual(promotedReg.last_name, 'หนึ่ง');

  const wl1Entry = inMemoryWaitlist.find((w) => w.phone_normalized === '0900000002')!;
  const wl2Entry = inMemoryWaitlist.find((w) => w.phone_normalized === '0900000003')!;
  assert.strictEqual(wl1Entry.status, 'NOTIFIED', 'first entry is NOTIFIED');
  assert.strictEqual(wl1Entry.promoted_registration_id, promotedReg.id, 'entry links the promoted registration');
  assert.strictEqual(wl2Entry.status, 'WAITING', 'second entry stays WAITING (FIFO)');

  // 1 (cancelled) − 1 (freed) + 1 (promoted) = capacity again.
  assert.strictEqual(slot1.booked_count, capacity, 'booked_count: −1 on cancel, +1 on promotion');
  console.log('✓ FIFO promotion: first WAITING donor NOTIFIED, second stays WAITING\n');

  // ---- Test 3: cannot cancel COMPLETED; unknown id rejected ----
  console.log('Test 3: COMPLETED cannot be cancelled; unknown id rejected');
  const before5 = slot5.booked_count;
  const regC = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'เสร็จ',
    lastName: 'สมบูรณ์',
    phone: '0900000005',
    participantType: 'GENERAL_PUBLIC',
    donationExperience: 'RETURNING',
    slotId: 'ts-5',
  });
  assert.strictEqual(regC.success, true);
  const idC = regC.registration!.id;

  const ci = await updateRegistrationStatus(idC, 'CHECKED_IN');
  assert.strictEqual(ci.success, true);
  const ip = await updateRegistrationStatus(idC, 'IN_PROCESS');
  assert.strictEqual(ip.success, true);
  const done = await updateRegistrationStatus(idC, 'COMPLETED');
  assert.strictEqual(done.success, true);

  const cancelDone = await cancelRegistration(idC, 'u-admin');
  assert.strictEqual(cancelDone.success, false, 'COMPLETED registration must not be cancellable');
  assert.match(cancelDone.message || '', /COMPLETED/, 'error names the blocking status');
  assert.strictEqual(slot5.booked_count, before5 + 1, 'no capacity change for a rejected cancel');

  const cancelMissing = await cancelRegistration('reg-does-not-exist');
  assert.strictEqual(cancelMissing.success, false, 'unknown registration id must fail');
  assert.match(cancelMissing.message || '', /ไม่พบข้อมูล/, 'unknown id reports not-found');
  console.log('✓ state machine gates cancel; unknown ids rejected\n');

  // ---- Test 4: admin deletion removes an uncompleted donor and releases seat ----
  console.log('Test 4: Delete an uncompleted donor permanently releases the seat');
  const beforeDelete = slot5.booked_count;
  const regD = await registerDonorAtomic({
    eventId: defaultEvent.id, firstName: 'ลบ', lastName: 'ถาวร', phone: '0900000006',
    participantType: 'GENERAL_PUBLIC', donationExperience: 'FIRST_TIME', slotId: 'ts-5',
  });
  assert.strictEqual(regD.success, true);
  const deleted = await deleteDonorRegistration(regD.registration!.id, 'u-admin');
  assert.strictEqual(deleted.success, true);
  assert.strictEqual(inMemoryRegistrations.some((r) => r.id === regD.registration!.id), false, 'deleted donor is removed from the list');
  assert.strictEqual(slot5.booked_count, beforeDelete, 'deletion releases the slot seat');
  console.log('✓ donor record is deleted and seat released\n');

  console.log('🎉 ALL CANCEL FLOW TESTS PASSED SUCCESSFULLY!');
}

runCancelTests().catch((err) => {
  console.error('❌ Cancel flow test suite failed:', err);
  process.exit(1);
});
