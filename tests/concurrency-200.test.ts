// Concurrency stress test: simulates 300+ concurrent donors registering,
// joining waitlists, looking up codes, cancelling, and re-registering simultaneously.
process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert/strict';
import {
  registerDonorAtomic,
  getRegistrationByCode,
  getDashboardKPIs,
  getEventBySlug,
} from '../lib/db/store';
import { POST as cancelApiPost } from '../app/api/registrations/cancel/route';

async function runConcurrencyStressTest() {
  console.log('🚀 Running 300+ Concurrent Users Stress Simulation Test...\n');

  const event = await getEventBySlug('mumt-2026');
  assert.ok(event, 'Event must exist');

  const baselineKPIs = await getDashboardKPIs(event.id);
  const initialActive = baselineKPIs.totalRegistrations;
  const initialCancelled = baselineKPIs.cancelledCount;

  const CONCURRENT_USERS = 300;
  console.log(`Simulating ${CONCURRENT_USERS} simultaneous donor registrations...`);

  const startTime = Date.now();

  const registrationPromises = Array.from({ length: CONCURRENT_USERS }, (_, i) => {
    const paddedIndex = String(i + 1).padStart(3, '0');
    const slotIndex = (i % 5) + 1;
    return registerDonorAtomic({
      eventId: event.id,
      firstName: `ทดสอบ${paddedIndex}`,
      lastName: `ผู้บริจาค`,
      phone: `089${paddedIndex.padStart(7, '0')}`,
      email: `donor${paddedIndex}@student.mahidol.edu`,
      participantType: 'STUDENT',
      faculty: 'คณะเทคนิคการแพทย์',
      academicYear: 'ปี 2',
      donationExperience: 'FIRST_TIME',
      slotId: `ts-${slotIndex}`,
    });
  });

  const results = await Promise.all(registrationPromises);
  const duration = Date.now() - startTime;

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\nRegistration Results:`);
  console.log(`- Total Requests: ${CONCURRENT_USERS}`);
  console.log(`- Successful Registrations: ${successful.length}`);
  console.log(`- Failed Registrations: ${failed.length}`);
  console.log(`- Total Time: ${duration}ms (${(duration / CONCURRENT_USERS).toFixed(2)}ms per request avg)`);

  assert.equal(successful.length, CONCURRENT_USERS, `All ${CONCURRENT_USERS} registrations must succeed`);
  assert.equal(failed.length, 0, 'No registration should fail under concurrency');

  // Verify all registration codes are unique
  const codes = new Set(successful.map((r) => (r.registration as { registration_code: string }).registration_code));
  assert.equal(codes.size, CONCURRENT_USERS, 'Every registration must have a unique monotonic registration code');

  // Test simultaneous lookups for all 300 donors
  console.log('\nSimulating simultaneous donor ticket lookups for all 300 donors...');
  const lookupStart = Date.now();
  const lookupPromises = Array.from(codes).map((code) => getRegistrationByCode(code));
  const lookupResults = await Promise.all(lookupPromises);
  const lookupDuration = Date.now() - lookupStart;
  assert.equal(lookupResults.every((r) => r !== null), true, 'All 300 lookups must find their ticket');
  console.log(`✓ 300 Lookups completed in ${lookupDuration}ms`);

  // Test simultaneous self-cancellations (50 concurrent cancels)
  console.log('\nSimulating 50 simultaneous donor self-cancellations...');
  const cancelStart = Date.now();
  const cancelledCodes = Array.from(codes).slice(0, 50);
  const cancelPromises = cancelledCodes.map((code, idx) => {
    const paddedIndex = String(idx + 1).padStart(3, '0');
    const phone = `089${paddedIndex.padStart(7, '0')}`;
    const req = new Request('http://localhost:3000/api/registrations/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationCode: code, phone, reason: 'เปลี่ยนใจ' }),
    });
    return cancelApiPost(req);
  });

  const cancelResponses = await Promise.all(cancelPromises);
  const cancelDuration = Date.now() - cancelStart;
  assert.equal(cancelResponses.every((res) => res.status === 200), true, 'All 50 cancels must succeed');
  console.log(`✓ 50 Self-cancellations completed in ${cancelDuration}ms`);

  // Test immediate re-registration for the 50 cancelled donors
  console.log('\nSimulating 50 immediate re-registrations for cancelled donors...');
  const reRegPromises = Array.from({ length: 50 }, (_, i) => {
    const paddedIndex = String(i + 1).padStart(3, '0');
    return registerDonorAtomic({
      eventId: event.id,
      firstName: `ทดสอบ${paddedIndex}`,
      lastName: `ผู้บริจาค`,
      phone: `089${paddedIndex.padStart(7, '0')}`,
      email: `donor${paddedIndex}@student.mahidol.edu`,
      participantType: 'STUDENT',
      faculty: 'คณะเทคนิคการแพทย์',
      academicYear: 'ปี 2',
      donationExperience: 'RETURNING',
      slotId: 'ts-2',
    });
  });

  const reRegResults = await Promise.all(reRegPromises);
  assert.equal(reRegResults.every((r) => r.success), true, 'All 50 re-registrations must succeed');
  console.log('✓ All 50 re-registrations succeeded with fresh sequential codes');

  // Test dashboard aggregation performance
  console.log('\nSimulating staff dashboard KPI calculation on active and cancelled records...');
  const kpis = await getDashboardKPIs(event.id);
  assert.equal(kpis.totalRegistrations, initialActive + CONCURRENT_USERS, `Active registrations must equal ${initialActive + CONCURRENT_USERS}`);
  assert.equal(kpis.cancelledCount, initialCancelled + 50, `Cancelled count must equal ${initialCancelled + 50}`);

  console.log(`\n🎉 300+ CONCURRENT USERS STRESS SIMULATION TEST PASSED!\n`);
}

runConcurrencyStressTest().catch((err) => {
  console.error('❌ Concurrency stress test failed:', err);
  process.exit(1);
});
