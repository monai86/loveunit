import assert from 'node:assert/strict';
import { 
  formatBangkokTime, 
  isCheckinOnTime, 
  isRegistrationEligibleForSouvenir, 
  getSouvenirEligibilityDetails,
  generateRegistrationCode,
  nextRegistrationSequence,
  isWalkInRecord,
  SouvenirCandidate 
} from '../lib/utils/format';

console.log('🧪 Running Souvenir Eligibility & Walk-in Code Test Suite...\n');

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

// --- Test 3: Walk-in Registration Code Sequence ---
console.log('Test 3: Walk-in Registration Code Sequence (LVU26-W001, LVU26-W002, ...)');
const onlineCodes = ['LVU26-001', 'LVU26-002', 'LVU26-003'];
const walkInCodes = ['LVU26-W001', 'LVU26-W002'];

assert.strictEqual(generateRegistrationCode(1, 'ONLINE'), 'LVU26-001');
assert.strictEqual(generateRegistrationCode(1, 'WALK_IN'), 'LVU26-W001');
assert.strictEqual(generateRegistrationCode(42, 'WALK_IN'), 'LVU26-W042');

const nextOnlineSeq = nextRegistrationSequence([...onlineCodes, ...walkInCodes], 'ONLINE');
assert.strictEqual(nextOnlineSeq, 4, 'Online sequence ignores Walk-in codes');

const nextWalkInSeq = nextRegistrationSequence([...onlineCodes, ...walkInCodes], 'WALK_IN');
assert.strictEqual(nextWalkInSeq, 3, 'Walk-in sequence ignores Online codes and starts from its own max');

assert.strictEqual(isWalkInRecord('LVU26-W001'), true);
assert.strictEqual(isWalkInRecord('LVU26-001'), false);
assert.strictEqual(isWalkInRecord({ source: 'WALK_IN', registrationCode: 'LVU26-W005' }), true);
console.log('✓ Walk-in codes generate separate LVU26-W... sequence independently\n');

// --- Test 4: Online Souvenir Quota roll-over for 100 souvenirs ---
console.log('Test 4: Online Quota roll-over for 100 souvenirs');

const onlineCandidates: SouvenirCandidate[] = [];

// Create 110 online registrations (LVU26-001 to LVU26-110)
for (let i = 1; i <= 110; i++) {
  const padded = String(i).padStart(3, '0');
  onlineCandidates.push({
    id: `reg-online-${i}`,
    registrationCode: `LVU26-${padded}`,
    source: 'ONLINE',
    status: 'CHECKED_IN',
    checkedInAt: '2026-09-18T09:15:00.000Z',
    slotEndAt: '2026-09-18T10:00:00.000Z',
  });
}

// Before any cancellation, 1..100 are eligible, 101..110 are not
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[0], onlineCandidates, 100), true, '#001 is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[99], onlineCandidates, 100), true, '#100 is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[100], onlineCandidates, 100), false, '#101 is initially NOT eligible');

// Donor #020 CANCELLED their registration
onlineCandidates[19].status = 'CANCELLED';

// Donor #045 arrived LATE
onlineCandidates[44].checkedInAt = '2026-09-18T10:30:00.000Z'; // slot ended at 10:00:00

// Verify #020 (cancelled) and #045 (late) are not eligible
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[19], onlineCandidates, 100), false);
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[44], onlineCandidates, 100), false);

// Now, the 2 freed quota spots roll over to #101 and #102
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[100], onlineCandidates, 100), true, '#101 gets rolled-over slot');
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[101], onlineCandidates, 100), true, '#102 gets rolled-over slot');
assert.strictEqual(isRegistrationEligibleForSouvenir(onlineCandidates[102], onlineCandidates, 100), false, '#103 exceeds quota');

console.log('✓ Online Quota roll-over works correctly\n');

// --- Test 5: Walk-in Souvenir Eligibility based on Completion Time ---
console.log('Test 5: Walk-in Souvenir Eligibility based on COMPLETION TIME (Not Registration Code)');

const walkInCandidates: SouvenirCandidate[] = [];

// Create 105 Walk-in donors (LVU26-W001 to LVU26-W105)
for (let i = 1; i <= 105; i++) {
  const padded = String(i).padStart(3, '0');
  walkInCandidates.push({
    id: `reg-walkin-${i}`,
    registrationCode: `LVU26-W${padded}`,
    source: 'WALK_IN',
    status: 'CHECKED_IN',
    checkedInAt: '2026-09-18T09:00:00.000Z',
    completedAt: null,
  });
}

// While CHECKED_IN or IN_PROCESS, walk-in donors are pending completion and not yet eligible
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInCandidates[0], walkInCandidates, 100), false, 'Walk-in #001 pending completion is not eligible yet');
const pendingDetails = getSouvenirEligibilityDetails(walkInCandidates[0], walkInCandidates, 100, 100);
assert.strictEqual(pendingDetails.isPending, true);

// Case: Walk-in #100 completes donation FIRST at 09:15
walkInCandidates[99].status = 'COMPLETED';
walkInCandidates[99].completedAt = '2026-09-18T09:15:00.000Z';

// Walk-in #001 completes donation LATER at 11:30
walkInCandidates[0].status = 'COMPLETED';
walkInCandidates[0].completedAt = '2026-09-18T11:30:00.000Z';

// Both are within the 100 quota, but Walk-in #100 ranks #1 because they finished first!
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInCandidates[99], walkInCandidates, 100), true, 'Walk-in #100 is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInCandidates[0], walkInCandidates, 100), true, 'Walk-in #001 is eligible');

const details100 = getSouvenirEligibilityDetails(walkInCandidates[99], walkInCandidates, 100, 100);
assert.strictEqual(details100.rank, 1, 'Walk-in #100 who completed first gets Rank 1 in Walk-in souvenir list');

const details001 = getSouvenirEligibilityDetails(walkInCandidates[0], walkInCandidates, 100, 100);
assert.strictEqual(details001.rank, 2, 'Walk-in #001 who completed second gets Rank 2 in Walk-in souvenir list');

// Simulate 100 completed walk-ins in total
for (let i = 1; i <= 100; i++) {
  walkInCandidates[i - 1].status = 'COMPLETED';
  walkInCandidates[i - 1].completedAt = new Date(Date.parse('2026-09-18T09:00:00.000Z') + i * 60000).toISOString();
}

// 101st walk-in donor completes after the first 100
walkInCandidates[100].status = 'COMPLETED';
walkInCandidates[100].completedAt = new Date(Date.parse('2026-09-18T09:00:00.000Z') + 101 * 60000).toISOString();

// Check 100th vs 101st completed walk-in
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInCandidates[99], walkInCandidates, 100), true, '100th completed walk-in is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInCandidates[100], walkInCandidates, 100), false, '101st completed walk-in exceeds 100 quota');

console.log('✓ Walk-in souvenir eligibility strictly follows completion order (first 100 completed donors)\n');

// --- Test 6: Continuous Unlimited Walk-in Registrations ---
console.log('Test 6: Continuous Walk-in registration remains open indefinitely even after 100+ souvenirs');

// Ensure all 1..105 have completed
for (let i = 1; i <= 105; i++) {
  walkInCandidates[i - 1].status = 'COMPLETED';
  if (!walkInCandidates[i - 1].completedAt) {
    walkInCandidates[i - 1].completedAt = new Date(Date.parse('2026-09-18T09:00:00.000Z') + i * 60000).toISOString();
  }
}

// Create Walk-in donors 106 to 250 (LVU26-W106 to LVU26-W250)
for (let i = 106; i <= 250; i++) {
  const padded = String(i).padStart(3, '0');
  walkInCandidates.push({
    id: `reg-walkin-${i}`,
    registrationCode: `LVU26-W${padded}`,
    source: 'WALK_IN',
    status: 'COMPLETED',
    checkedInAt: '2026-09-18T12:00:00.000Z',
    completedAt: new Date(Date.parse('2026-09-18T12:00:00.000Z') + i * 60000).toISOString(),
  });
}

assert.strictEqual(walkInCandidates.length, 250, 'System supports 250+ walk-in records');
assert.strictEqual(walkInCandidates[249].registrationCode, 'LVU26-W250');
assert.strictEqual(isRegistrationEligibleForSouvenir(walkInCandidates[249], walkInCandidates, 100), false, '250th walk-in completed successfully without souvenir');

const details250 = getSouvenirEligibilityDetails(walkInCandidates[249], walkInCandidates, 100, 100);
assert.strictEqual(details250.eligible, false);
assert.strictEqual(details250.rank, 250);
console.log('✓ Walk-in registration and check-in continue indefinitely for all donors\n');

console.log('🎉 ALL SOUVENIR ELIGIBILITY & WALK-IN TESTS PASSED SUCCESSFULLY!');
