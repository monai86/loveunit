import assert from 'node:assert/strict';
import { isTimeSlotSelectable } from '../lib/registration/slot-availability';
import { defaultEvent, defaultSlots } from '../lib/db/store';
import { registerDonorAtomic } from '../services/registration-service';

process.env.DATA_BACKEND = 'memory';

async function runSlotTests() {
  console.log('🕒 Running unlimited time-slot tests...');

  assert.equal(isTimeSlotSelectable({ status: 'FULL', remainingCapacity: 0 }), true);
  assert.equal(isTimeSlotSelectable({ status: 'LIMITED', remainingCapacity: 1 }), true);
  assert.equal(isTimeSlotSelectable({ status: 'AVAILABLE', remainingCapacity: 0 }), true);

  const slot = defaultSlots[0];
  slot.booked_count = slot.capacity;
  const registration = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'ทดสอบ',
    lastName: 'รอบไม่จำกัด',
    phone: '0800000999',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: slot.id,
  });
  assert.equal(registration.success, true, 'a previously full time slot must still accept registrations');
  console.log('✓ All time slots remain selectable and accept registrations without capacity limits');
}

runSlotTests().catch((error) => {
  console.error('Unlimited time-slot tests failed:', error);
  process.exit(1);
});
