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

console.log('🧪 Running 2-Tier Fair Souvenir Eligibility & Walk-in Test Suite...\n');

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

assert.strictEqual(isCheckinOnTime('2026-09-18T09:45:00.000Z', slotEnd), true, 'before end time is on-time');
assert.strictEqual(isCheckinOnTime('2026-09-18T10:00:00.000Z', slotEnd), true, 'exactly at end time is on-time');
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

// --- Test 4: Tier 1 Online Top 100 Guaranteed Quota & Spillover to On-Site Pool ---
console.log('Test 4: Tier 1 Online Top 100 Guaranteed Quota & Spillover to On-Site Pool');

const allCandidates: SouvenirCandidate[] = [];

// Create 100 Tier 1 online registrations (LVU26-001 to LVU26-100)
for (let i = 1; i <= 100; i++) {
  const padded = String(i).padStart(3, '0');
  allCandidates.push({
    id: `reg-online-${i}`,
    registrationCode: `LVU26-${padded}`,
    source: 'ONLINE',
    status: 'COMPLETED',
    checkedInAt: '2026-09-18T09:15:00.000Z',
    completedAt: '2026-09-18T09:30:00.000Z',
    slotEndAt: '2026-09-18T10:00:00.000Z',
  });
}

// Create Online #101 and #102 who registered late
allCandidates.push({
  id: 'reg-online-101',
  registrationCode: 'LVU26-101',
  source: 'ONLINE',
  status: 'COMPLETED',
  checkedInAt: '2026-09-18T09:05:00.000Z',
  completedAt: '2026-09-18T09:20:00.000Z', // Completed very early at 09:20
  slotEndAt: '2026-09-18T10:00:00.000Z',
});

allCandidates.push({
  id: 'reg-online-102',
  registrationCode: 'LVU26-102',
  source: 'ONLINE',
  status: 'COMPLETED',
  checkedInAt: '2026-09-18T11:00:00.000Z',
  completedAt: '2026-09-18T11:30:00.000Z', // Completed later at 11:30
  slotEndAt: '2026-09-18T12:00:00.000Z',
});

// Create 98 Walk-in completed donors
for (let i = 1; i <= 98; i++) {
  const padded = String(i).padStart(3, '0');
  allCandidates.push({
    id: `reg-walkin-${i}`,
    registrationCode: `LVU26-W${padded}`,
    source: 'WALK_IN',
    status: 'COMPLETED',
    checkedInAt: '2026-09-18T09:30:00.000Z',
    completedAt: new Date(Date.parse('2026-09-18T09:40:00.000Z') + i * 60000).toISOString(),
  });
}

// 1. Online #001..#100 are eligible in Tier 1
assert.strictEqual(isRegistrationEligibleForSouvenir(allCandidates[0], allCandidates, 100, 100), true, '#001 is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(allCandidates[99], allCandidates, 100, 100), true, '#100 is eligible');

// 2. Online #101 completed at 09:20 (earliest in On-site pool) -> Must be Rank 1 in On-Site Pool!
const donor101 = allCandidates.find((r) => r.id === 'reg-online-101')!;
assert.strictEqual(isRegistrationEligibleForSouvenir(donor101, allCandidates, 100, 100), true, '#101 who finished early gets On-Site souvenir');
const details101 = getSouvenirEligibilityDetails(donor101, allCandidates, 100, 100);
assert.strictEqual(details101.eligible, true);
assert.strictEqual(details101.rank, 1, '#101 has Rank 1 in On-Site pool');

// 3. Online #050 cancels their registration
const donor50 = allCandidates.find((r) => r.registrationCode === 'LVU26-050')!;
donor50.status = 'CANCELLED';

// #050 is no longer eligible
assert.strictEqual(isRegistrationEligibleForSouvenir(donor50, allCandidates, 100, 100), false);

// The On-site pool now expands by +1 (from 100 to 101 items) to absorb the cancelled slot
const donor102 = allCandidates.find((r) => r.id === 'reg-online-102')!;
assert.strictEqual(isRegistrationEligibleForSouvenir(donor102, allCandidates, 100, 100), true, '#102 gets on-site souvenir within expanded pool');

console.log('✓ Tier 1 Online and Tier 2 On-Site Pool work seamlessly and fairly\n');

// --- Test 5: Walk-in and Online 101+ Chronological Competition ---
console.log('Test 5: Walk-in and Online 101+ Chronological Competition in On-Site Pool');

const walkInPool: SouvenirCandidate[] = [];

// 1 Online 101+ donor
walkInPool.push({
  id: 'online-101',
  registrationCode: 'LVU26-101',
  source: 'ONLINE',
  status: 'COMPLETED',
  completedAt: '2026-09-18T09:10:00.000Z', // 1st
});

// 1 Walk-in donor who finished at 09:15
walkInPool.push({
  id: 'walkin-1',
  registrationCode: 'LVU26-W001',
  source: 'WALK_IN',
  status: 'COMPLETED',
  completedAt: '2026-09-18T09:15:00.000Z', // 2nd
});

// 1 Walk-in donor who hasn't completed (status CHECKED_IN)
walkInPool.push({
  id: 'walkin-2',
  registrationCode: 'LVU26-W002',
  source: 'WALK_IN',
  status: 'CHECKED_IN',
  completedAt: null,
});

// Online 101 is Rank 1, Walk-in 1 is Rank 2
const dOnline101 = getSouvenirEligibilityDetails(walkInPool[0], walkInPool, 0, 100);
const dWalkin1 = getSouvenirEligibilityDetails(walkInPool[1], walkInPool, 0, 100);
const dWalkin2 = getSouvenirEligibilityDetails(walkInPool[2], walkInPool, 0, 100);

assert.strictEqual(dOnline101.eligible, true);
assert.strictEqual(dOnline101.rank, 1);

assert.strictEqual(dWalkin1.eligible, true);
assert.strictEqual(dWalkin1.rank, 2);

assert.strictEqual(dWalkin2.eligible, false, 'Uncompleted walk-in is not eligible yet');
assert.strictEqual(dWalkin2.isPending, true);

console.log('✓ Chronological completion ranking operates without bias between Walk-in and 101+\n');

// --- Test 6: Capacity and Beyond Quota Handling ---
console.log('Test 6: Capacity and Beyond Quota Handling');

const largePool: SouvenirCandidate[] = [];
// 100 completed in Tier 2
for (let i = 1; i <= 100; i++) {
  largePool.push({
    id: `pool-${i}`,
    registrationCode: i % 2 === 0 ? `LVU26-W${String(i).padStart(3, '0')}` : `LVU26-${String(100 + i).padStart(3, '0')}`,
    source: i % 2 === 0 ? 'WALK_IN' : 'ONLINE',
    status: 'COMPLETED',
    completedAt: new Date(Date.parse('2026-09-18T09:00:00.000Z') + i * 60000).toISOString(),
  });
}

// 101st completed in Tier 2
largePool.push({
  id: 'pool-101',
  registrationCode: 'LVU26-W101',
  source: 'WALK_IN',
  status: 'COMPLETED',
  completedAt: new Date(Date.parse('2026-09-18T09:00:00.000Z') + 101 * 60000).toISOString(),
});

assert.strictEqual(isRegistrationEligibleForSouvenir(largePool[99], largePool, 0, 100), true, '100th completed is eligible');
assert.strictEqual(isRegistrationEligibleForSouvenir(largePool[100], largePool, 0, 100), false, '101st completed is NOT eligible');

console.log('✓ Quota limits and boundary conditions pass with 100% precision\n');

console.log('🎉 ALL 2-TIER SOUVENIR ELIGIBILITY TESTS PASSED SUCCESSFULLY!');
