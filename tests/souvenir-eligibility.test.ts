import assert from 'node:assert/strict';
import { 
  formatBangkokTime, 
  isCheckinOnTime, 
  isRegistrationEligibleForSouvenir, 
  SouvenirCandidate 
} from '../lib/utils/format';

console.log('🧪 Running Souvenir Eligibility & Check-in Time Test Suite...\n');

// --- Test 1: formatBangkokTime formatting ---
console.log('Test 1: formatBangkokTime produces HH:MM น. in Bangkok timezone');
const t1 = formatBangkokTime('2026-09-18T02:15:00.000Z'); // 02:15 UTC = 09:15 Bangkok (UTC+7)
assert.strictEqual(t1, '09:15 น.');

const tEmpty = formatBangkokTime(null);
assert.strictEqual(tEmpty, '');
console.log('✓ Time formatting works correctly\n');

// --- Test 2: isCheckinOnTime strict check ---
console.log('Test 2: isCheckinOnTime strict check (no late permitted)');
const slotEnd = '2026-09-18T10:00:00.000Z';

// Checked in before end time
assert.strictEqual(isCheckinOnTime('2026-09-18T09:45:00.000Z', slotEnd), true, 'before end time is on-time');
// Checked in exactly at end time
assert.strictEqual(isCheckinOnTime('2026-09-18T10:00:00.000Z', slotEnd), true, 'exactly at end time is on-time');
// Checked in after end time
assert.strictEqual(isCheckinOnTime('2026-09-18T10:00:01.000Z', slotEnd), false, 'after end time is late');
assert.strictEqual(isCheckinOnTime('2026-09-18T10:30:00.000Z', slotEnd), false, '30 mins after end time is late');
console.log('✓ On-time evaluation works strictly\n');

// --- Test 3: Quota roll-over for 100 souvenirs ---
console.log('Test 3: Quota roll-over for 100 souvenirs (cancellations and late checkins pass quota to next on-time donors)');

const candidates: SouvenirCandidate[] = [];

// Create 110 online registrations (LVU26-001 to LVU26-110)
for (let i = 1; i <= 110; i++) {
  const padded = String(i).padStart(3, '0');
  candidates.push({
    id: `reg-${i}`,
    registrationCode: `LVU26-${padded}`,
    source: 'ONLINE',
    status: 'CHECKED_IN',
    checkedInAt: '2026-09-18T09:15:00.000Z',
    slotEndAt: '2026-09-18T10:00:00.000Z',
  });
}

// Case A: Before any cancellation, 1..100 are eligible, 101..110 are not
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[0], candidates, 100), true, '#001 is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[99], candidates, 100), true, '#100 is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[100], candidates, 100), false, '#101 is initially NOT eligible');

// Case B: Donor #020 CANCELLED their registration
candidates[19].status = 'CANCELLED';

// Case C: Donor #045 arrived LATE
candidates[44].checkedInAt = '2026-09-18T10:30:00.000Z'; // slot ended at 10:00:00

// Verify #020 (cancelled) and #045 (late) are not eligible
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[19], candidates, 100), false, '#020 (CANCELLED) is not eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[44], candidates, 100), false, '#045 (LATE) is not eligible');

// Now, the 2 freed quota spots roll over to #101 and #102!
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[100], candidates, 100), true, '#101 gets rolled-over souvenir slot!');
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[101], candidates, 100), true, '#102 gets rolled-over souvenir slot!');

// Donor #103 remains beyond quota (rank 101 in eligible list)
assert.strictEqual(isRegistrationEligibleForSouvenir(candidates[102], candidates, 100), false, '#103 is not eligible (exceeds 100 quota)');

console.log('✓ Quota roll-over correctly allocated to #101 and #102 when #020 cancelled and #045 arrived late\n');

// --- Test 4: Walk-in exclusion ---
console.log('Test 4: WALK_IN donors do not consume online souvenir quota');
const walkInReg: SouvenirCandidate = {
  id: 'reg-walkin',
  registrationCode: 'LVU26-WALK01',
  source: 'WALK_IN',
  status: 'CHECKED_IN',
  checkedInAt: '2026-09-18T09:15:00.000Z',
  slotEndAt: '2026-09-18T10:00:00.000Z',
};
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInReg, [...candidates, walkInReg], 100), false);
console.log('✓ Walk-in donor correctly excluded from online souvenir quota\n');

console.log('🎉 ALL SOUVENIR ELIGIBILITY TESTS PASSED SUCCESSFULLY!');
