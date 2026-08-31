process.env.DATA_BACKEND = 'memory';
// @ts-expect-error test-only environment override
process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import { 
  registerDonorAtomic,
  defaultSlots,
  inMemoryRegistrations
} from '../lib/db/store';
import { searchRegistrations, checkInDonor, updateRegistrationStatus } from '../services/checkin-service';

console.log('🧪 Running Staff Search & Check-in Test Suite...\n');

async function runTests() {
  inMemoryRegistrations.length = 0;

  // Seed online and walk-in registrations
  const reg1 = await registerDonorAtomic({
    eventId: 'mumt-2026',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phone: '081-234-5678',
    email: 'somchai@example.com',
    participantType: 'STUDENT',
    faculty: 'คณะเทคนิคการแพทย์',
    academicYear: 'YEAR_3',
    donationExperience: 'RETURNING',
    slotId: defaultSlots[0].id,
  });
  assert.strictEqual(reg1.success, true);
  const donorOnline1 = reg1.registration!;

  const reg2 = await registerDonorAtomic({
    eventId: 'mumt-2026',
    firstName: 'John',
    lastName: 'Doe',
    phone: '089-987-6543',
    email: 'john@example.com',
    participantType: 'GENERAL_PUBLIC',
    donationExperience: 'FIRST_TIME',
    slotId: defaultSlots[1].id,
  });
  assert.strictEqual(reg2.success, true);

  const regWalkIn = await registerDonorAtomic({
    eventId: 'mumt-2026',
    firstName: 'กิตติพงษ์',
    lastName: 'พร้อมเพรียง',
    phone: '095-555-1234',
    email: '',
    participantType: 'STAFF',
    faculty: 'คณะพยาบาลศาสตร์',
    donationExperience: 'RETURNING',
    source: 'WALK_IN',
  });
  assert.strictEqual(regWalkIn.success, true);
  const donorWalkIn1 = regWalkIn.registration!;

  console.log('Test 1: Search by Advance Registration Code (Exact & Partial)');
  const resCodeExact = (await searchRegistrations(donorOnline1.registration_code)) as Array<Record<string, unknown>>;
  assert.strictEqual(resCodeExact.length >= 1, true, 'exact code should find donor');
  assert.strictEqual(resCodeExact[0].first_name || resCodeExact[0].firstName, 'สมชาย');
  assert.strictEqual(resCodeExact[0].isWalkIn, false);

  const resCodePartial = (await searchRegistrations('001')) as Array<Record<string, unknown>>;
  assert.strictEqual(resCodePartial.some(r => String(r.registration_code || r.registrationCode || '').includes('001')), true);
  console.log('✓ Advance code search works\n');

  console.log('Test 2: Search by Walk-in Registration Code (LVU26-W... & W001)');
  const resWalkInExact = (await searchRegistrations(donorWalkIn1.registration_code)) as Array<Record<string, unknown>>;
  assert.strictEqual(resWalkInExact.length >= 1, true, 'walk-in exact code finds donor');
  assert.strictEqual(resWalkInExact[0].first_name || resWalkInExact[0].firstName, 'กิตติพงษ์');
  assert.strictEqual(resWalkInExact[0].isWalkIn, true);

  const resWalkInPartial = (await searchRegistrations('W001')) as Array<Record<string, unknown>>;
  assert.strictEqual(resWalkInPartial.length >= 1, true, 'W001 finds walk-in donor');
  console.log('✓ Walk-in code search works\n');

  console.log('Test 3: Search by First Name, Last Name, and Full Name with Space');
  const resFirstName = (await searchRegistrations('สมชาย')) as Array<Record<string, unknown>>;
  assert.strictEqual(resFirstName.length >= 1, true);
  assert.strictEqual(resFirstName[0].phone, '081-234-5678');

  const resLastName = (await searchRegistrations('ใจดี')) as Array<Record<string, unknown>>;
  assert.strictEqual(resLastName.length >= 1, true);

  const resFullName = (await searchRegistrations('สมชาย ใจดี')) as Array<Record<string, unknown>>;
  assert.strictEqual(resFullName.length >= 1, true, 'Full name with space should match');
  assert.strictEqual(resFullName[0].registration_code || resFullName[0].registrationCode, donorOnline1.registration_code);

  const resEnglish = (await searchRegistrations('John Doe')) as Array<Record<string, unknown>>;
  assert.strictEqual(resEnglish.length >= 1, true, 'English full name should match');
  console.log('✓ Name and full name search works\n');

  console.log('Test 4: Search by Phone Number (Formatted, Raw digits, and 4-digit Suffix)');
  const resPhoneFormatted = (await searchRegistrations('081-234-5678')) as Array<Record<string, unknown>>;
  assert.strictEqual(resPhoneFormatted.length >= 1, true);
  assert.strictEqual(resPhoneFormatted[0].first_name || resPhoneFormatted[0].firstName, 'สมชาย');

  const resPhoneDigits = (await searchRegistrations('0812345678')) as Array<Record<string, unknown>>;
  assert.strictEqual(resPhoneDigits.length >= 1, true, 'Raw digits match formatted phone');

  const resPhoneSuffix = (await searchRegistrations('5678')) as Array<Record<string, unknown>>;
  assert.strictEqual(resPhoneSuffix.length >= 1, true, 'Last 4 digits match phone');
  assert.strictEqual(resPhoneSuffix[0].first_name || resPhoneSuffix[0].firstName, 'สมชาย');

  const resWalkInPhone = (await searchRegistrations('1234')) as Array<Record<string, unknown>>;
  assert.strictEqual(resWalkInPhone.some(r => (r.first_name || r.firstName) === 'กิตติพงษ์'), true);
  console.log('✓ Phone search with all variations works\n');

  console.log('Test 5: Check-in donor found via search and complete donation');
  const target = resFirstName[0];
  assert.strictEqual(target.status, 'REGISTERED');

  const checkinResult = await checkInDonor(String(target.id), 'staff-tester');
  assert.strictEqual(checkinResult.success, true);
  assert.strictEqual(checkinResult.registration?.status, 'CHECKED_IN');

  const completeResult = await updateRegistrationStatus(String(target.id), 'COMPLETED', 'staff-tester');
  assert.strictEqual(completeResult.success, true);
  assert.strictEqual(completeResult.registration?.status, 'COMPLETED');
  console.log('✓ Direct check-in & completion workflow works\n');

  console.log('🎉 ALL STAFF SEARCH & CHECK-IN TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
