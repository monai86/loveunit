import assert from 'node:assert/strict';
import { isTimeSlotSelectable } from '../lib/registration/slot-availability';

console.log('🕒 Running time-slot availability tests...');

assert.equal(isTimeSlotSelectable({ status: 'FULL', remainingCapacity: 0 }), false);
assert.equal(isTimeSlotSelectable({ status: 'LIMITED', remainingCapacity: 1 }), true);
assert.equal(isTimeSlotSelectable({ status: 'AVAILABLE', remainingCapacity: 0 }), false);

console.log('✓ Full and zero-capacity slots cannot be selected');
