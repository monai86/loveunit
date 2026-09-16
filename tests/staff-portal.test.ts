import assert from 'node:assert/strict';
import { summarizeStaffRegistrations } from '../lib/staff/registration-summary';

console.log('📊 Running staff portal summary tests...');

const summary = summarizeStaffRegistrations([
  { status: 'REGISTERED' },
  { status: 'CHECKED_IN' },
  { status: 'IN_PROCESS' },
  { status: 'COMPLETED' },
  { status: 'CANCELLED' },
  { status: 'NO_SHOW' },
]);

assert.deepEqual(summary, {
  total: 5,
  waiting: 1,
  inQueue: 2,
  checkedIn: 3,
  completed: 1,
  cancelled: 1,
  attendanceRatePercent: 60,
});

console.log('✓ Staff portal shows totals and cumulative checked-in count correctly');
