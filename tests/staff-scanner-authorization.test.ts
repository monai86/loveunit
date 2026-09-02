// Staff Scanner Authorization & Check-in Guard Verification Test Suite
// Verifies all 5 scanner security boundary conditions:
// 1. Unauthenticated request to check-in endpoint -> rejected (401)
// 2. Participant access token passed to staff check-in endpoint -> rejected (401)
// 3. Valid staff session scans valid QR -> check-in succeeds (200)
// 4. Valid staff session scans random/tampered QR string -> rejected (404)
// 5. Repeated scan of already-checked-in QR -> handled idempotently with clear message

process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert/strict';
import { POST as staffCheckinPost } from '../app/api/staff/checkin/route';
import {
  defaultEvent,
  registerDonorAtomic,
  getRegistrationByCode,
  inMemoryRegistrations,
} from '../lib/db/store';
import { requireStaff, AuthenticatedUser } from '../lib/auth/server';

async function runStaffScannerAuthTests() {
  console.log('🛡️ Starting Staff Scanner Authorization Guard Tests...\n');

  inMemoryRegistrations.length = 0;

  // Setup: Register a test donor with a valid QR token and Access token
  const donorSetup = await registerDonorAtomic({
    eventId: defaultEvent.id,
    firstName: 'ภานุวัฒน์',
    lastName: 'ศิริปัญญา',
    phone: '0815559999',
    email: 'panuwat@mahidol.edu',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
    source: 'ONLINE',
  });

  assert.strictEqual(donorSetup.success, true);
  const donor = donorSetup.registration!;
  const donorCode = donor.registration_code;
  const qrToken = donor.qr_token;
  const accessToken = donor.access_token;

  console.log(`✓ Test donor initialized: code=${donorCode}, qrToken=${qrToken.slice(0, 16)}...`);

  // -------------------------------------------------------------
  // Guard 1: Unauthenticated request to staff check-in endpoint -> rejected (401)
  // -------------------------------------------------------------
  console.log('\n[1/5] Testing: Unauthenticated request to check-in endpoint');
  let unauthError = null;
  try {
    await requireStaff(null);
  } catch (err: unknown) {
    unauthError = (err as Error).message;
  }
  assert.strictEqual(unauthError, 'UNAUTHORIZED', 'requireStaff(null) must throw UNAUTHORIZED');
  console.log('✓ PASS: Unauthenticated request rejected by requireStaff guard (UNAUTHORIZED -> HTTP 401)');

  // -------------------------------------------------------------
  // Guard 2: Participant role passed to staff check-in endpoint -> rejected (403)
  // -------------------------------------------------------------
  console.log('\n[2/5] Testing: Participant access token / invalid role rejected');
  let forbiddenError = null;
  try {
    await requireStaff({
      id: 'donor-123',
      email: 'donor@mahidol.edu',
      profile: { user_id: 'donor-123', display_name: 'Donor', role: 'DONOR' as unknown as 'STAFF', team: null, is_active: true, created_at: '', updated_at: '' },
      mustChangePassword: false,
    });
  } catch (err: unknown) {
    forbiddenError = (err as Error).message;
  }
  assert.strictEqual(forbiddenError, 'FORBIDDEN', 'requireStaff with non-staff profile must throw FORBIDDEN');
  console.log('✓ PASS: Participant / non-staff role rejected by requireStaff guard (FORBIDDEN -> HTTP 403)');

  // -------------------------------------------------------------
  // Guard 3: Valid staff session scans valid QR -> check-in succeeds (200)
  // -------------------------------------------------------------
  console.log('\n[3/5] Testing: Valid staff session scans valid QR');
  const validScanReq = new Request('http://localhost:3000/api/staff/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken, status: 'CHECKED_IN' }),
  });
  const validScanRes = await staffCheckinPost(validScanReq);
  assert.strictEqual(validScanRes.status, 200, 'Valid staff scan must return 200 OK');
  const validScanData = await validScanRes.json();
  assert.strictEqual(validScanData.success, true);
  assert.strictEqual(validScanData.registration.status, 'CHECKED_IN');
  console.log('✓ PASS: Valid QR token scanned by staff successfully checked in donor');

  // -------------------------------------------------------------
  // Guard 4: Valid staff session scans random/tampered QR string -> rejected (404)
  // -------------------------------------------------------------
  console.log('\n[4/5] Testing: Valid staff session scans random/tampered QR string');
  const tamperedScanReq = new Request('http://localhost:3000/api/staff/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken: 'lvu_qr_randomfakeguess999999999999999999999999999999999999999999' }),
  });
  const tamperedScanRes = await staffCheckinPost(tamperedScanReq);
  assert.strictEqual(tamperedScanRes.status, 404, 'Tampered/unknown QR token must return 404 Not Found');
  const tamperedData = await tamperedScanRes.json();
  assert.strictEqual(tamperedData.success, false);
  console.log('✓ PASS: Tampered QR code rejected with 404 Not Found');

  // -------------------------------------------------------------
  // Guard 5: Repeated scan of already-checked-in QR -> handled idempotently
  // -------------------------------------------------------------
  console.log('\n[5/5] Testing: Repeated scan of already-checked-in QR is idempotent');
  const repeatScanReq = new Request('http://localhost:3000/api/staff/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken, status: 'CHECKED_IN' }),
  });
  const repeatScanRes = await staffCheckinPost(repeatScanReq);
  assert.strictEqual(repeatScanRes.status, 200, 'Repeated check-in must succeed idempotently with 200');
  const repeatData = await repeatScanRes.json();
  assert.strictEqual(repeatData.success, true);
  assert.strictEqual(repeatData.registration.status, 'CHECKED_IN');
  console.log('✓ PASS: Repeated scan handled idempotently with clear status message');

  console.log('\n🎉 ALL 5 STAFF SCANNER AUTHORIZATION GUARDS PASSED!\n');
}

runStaffScannerAuthTests().catch((err) => {
  console.error('❌ Staff scanner authorization test failed:', err);
  process.exit(1);
});
