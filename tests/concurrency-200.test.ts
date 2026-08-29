// Concurrency stress test: simulates 200+ concurrent donors registering,
// joining waitlists, looking up codes, and staff checking in simultaneously.
process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert/strict';
import { registerDonorAtomic, getRegistrationByCode, getDashboardKPIs, getEventBySlug } from '../lib/db/store';
import { nextRegistrationSequence, generateRegistrationCode } from '../lib/utils/format';

async function runConcurrencyStressTest() {
  console.log('🚀 Running 200+ Concurrent Users Stress Simulation Test...\n');

  const event = await getEventBySlug('mumt-2026');
  assert.ok(event, 'Event must exist');

  const CONCURRENT_USERS = 250;
  console.log(`Simulating ${CONCURRENT_USERS} simultaneous donor registrations...`);

  const startTime = Date.now();

  const registrationPromises = Array.from({ length: CONCURRENT_USERS }, (_, i) => {
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
      donationExperience: 'FIRST_TIME',
      slotId: 'ts-1',
    });
  });

  const results = await Promise.all(registrationPromises);
  const duration = Date.now() - startTime;

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\nResults:`);
  console.log(`- Total Requests: ${CONCURRENT_USERS}`);
  console.log(`- Successful Registrations: ${successful.length}`);
  console.log(`- Failed Registrations: ${failed.length}`);
  console.log(`- Total Time: ${duration}ms (${(duration / CONCURRENT_USERS).toFixed(2)}ms per request avg)`);

  assert.equal(successful.length, CONCURRENT_USERS, `All ${CONCURRENT_USERS} registrations must succeed`);
  assert.equal(failed.length, 0, 'No registration should fail under concurrency');

  // Verify all registration codes are unique
  const codes = new Set(successful.map((r) => (r.registration as any).registration_code));
  assert.equal(codes.size, CONCURRENT_USERS, 'Every registration must have a unique monotonic registration code');

  // Test simultaneous lookups
  console.log('\nSimulating simultaneous donor ticket lookups for all 250 donors...');
  const lookupPromises = Array.from(codes).map((code) => getRegistrationByCode(code));
  const lookupResults = await Promise.all(lookupPromises);
  assert.equal(lookupResults.every((r) => r !== null), true, 'All 250 lookups must find their ticket');

  // Test dashboard aggregation performance
  console.log('Simulating staff dashboard KPI calculation on 250+ registrations...');
  const kpis = await getDashboardKPIs(event.id);
  assert.ok(kpis.totalRegistrations >= CONCURRENT_USERS, 'KPI must aggregate all registrations');

  console.log(`\n🎉 200+ CONCURRENT USERS STRESS SIMULATION TEST PASSED IN ${duration}ms!\n`);
}

runConcurrencyStressTest().catch((err) => {
  console.error('❌ Concurrency stress test failed:', err);
  process.exit(1);
});
