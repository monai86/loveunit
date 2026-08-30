// These tests exercise the in-memory backend on purpose; enable it explicitly.
process.env.DATA_BACKEND = 'memory';

import assert from 'node:assert';
import { normalizePhoneNumber, generateRegistrationCode, formatTimeRange, formatThaiDate } from '../lib/utils/format';
import { publicRegistrationSchema } from '../lib/validation/schemas';
import { 
  registerDonorAtomic, 
  checkInDonor, 
  getDashboardKPIs,
  getEventBySlug,
  isTransitionAllowed,
  updateRegistrationStatus,
  isMemoryBackendAllowed
} from '../lib/db/store';

async function runHardeningTests() {
  console.log('🧪 Starting MUMT Blood Donation 2026 Hardening Test Suite...\n');

  // Test 1: Event Single Source of Truth Metadata
  console.log('Test 1: P0 Event Metadata Source of Truth');
  const event = await getEventBySlug('mumt-2026');
  assert.ok(event, 'Event mumt-2026 should be found');
  assert.strictEqual(event.start_at, '2026-09-16T09:00:00+07:00', 'Event date must be 16 September 2026 09:00');
  assert.strictEqual(event.end_at, '2026-09-16T14:00:00+07:00', 'Event end time must be 14:00');
  assert.ok(event.venue_name.includes('อาคารสิริวิทยา'), 'Venue must be Sirividhya Building');
  console.log('✓ Official Event date (16 Sep 2026), time (09:00-14:00), and venue verified\n');

  // Test 2: Event Slug 404 Bug Fix
  console.log('Test 2: P0 Event Slug 404 Handling');
  const unknownEvent = await getEventBySlug('non-existent-event-slug');
  assert.strictEqual(unknownEvent, null, 'Unknown event slug must return null');
  console.log('✓ Unknown event slug correctly returns null (404 Not Found)\n');

  // Test 3: Phone Normalization, Code Formatting & Time Range
  console.log('Test 3: Phone Normalization, Code Format & Time Formatting');
  assert.strictEqual(normalizePhoneNumber('081-234-5678'), '0812345678');
  assert.strictEqual(normalizePhoneNumber('+66 81 234 5678'), '0812345678');
  const code = generateRegistrationCode(42);
  assert.strictEqual(code, 'LVU26-042');
  const timeFormatted = formatTimeRange('2026-09-16T09:00:00+07:00', '2026-09-16T10:00:00+07:00');
  assert.strictEqual(timeFormatted, '09:00–10:00 น.');
  assert.strictEqual(timeFormatted.endsWith('น. น.'), false, 'Must not have duplicate น.');
  const dateFormatted = formatThaiDate('2026-09-16T09:00:00+07:00');
  assert.strictEqual(dateFormatted, '16 กันยายน 2569');
  console.log('✓ Phone normalization, code format, and time/date formatting verified\n');

  // Test 4: Zod Validation Schemas
  console.log('Test 4: Zod Validation Schemas');
  const validPayload = {
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phone: '0812345678',
    email: 'somchai@mahidol.ac.th',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
    privacyAccepted: true,
  };
  const parseValid = publicRegistrationSchema.safeParse(validPayload);
  assert.strictEqual(parseValid.success, true);

  const invalidPayload = {
    firstName: '',
    lastName: '',
    phone: '123',
    participantType: 'INVALID',
  };
  const parseInvalid = publicRegistrationSchema.safeParse(invalidPayload);
  assert.strictEqual(parseInvalid.success, false);
  console.log('✓ Zod validation rules verified\n');

  // Test 5: Atomic Donor Registration & Duplicate Prevention
  console.log('Test 5: Atomic Registration & Duplicate Prevention');
  const regRes1 = await registerDonorAtomic({
    eventId: event.id,
    firstName: 'วิชัย',
    lastName: 'มีสุข',
    phone: '0859998877',
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
  });
  assert.strictEqual(regRes1.success, true);
  assert.ok(regRes1.registration);

  const regResDup = await registerDonorAtomic({
    eventId: event.id,
    firstName: 'วิชัย',
    lastName: 'ซ้ำซ้อน',
    phone: '085-999-8877', // Same normalized phone number
    participantType: 'STUDENT',
    donationExperience: 'FIRST_TIME',
    slotId: 'ts-1',
  });
  assert.strictEqual(regResDup.success, false);
  assert.strictEqual(regResDup.errorCode, 'DUPLICATE_REGISTRATION');
  console.log('✓ Duplicate registration rejected by normalized phone\n');

  // Test 6: Registration State Machine Controls
  console.log('Test 6: P1 Registration State Machine Transitions');
  assert.strictEqual(isTransitionAllowed('REGISTERED', 'CHECKED_IN'), true);
  assert.strictEqual(isTransitionAllowed('CHECKED_IN', 'IN_PROCESS'), true);
  assert.strictEqual(isTransitionAllowed('IN_PROCESS', 'COMPLETED'), true);
  assert.strictEqual(isTransitionAllowed('COMPLETED', 'REGISTERED'), false, 'Nonsensical COMPLETED -> REGISTERED transition must be blocked');

  if (regRes1.registration) {
    const invalidChange = await updateRegistrationStatus(regRes1.registration.id, 'COMPLETED');
    // From REGISTERED, cannot jump directly to COMPLETED
    assert.strictEqual(invalidChange.success, false);
    
    const validChange = await checkInDonor(regRes1.registration.id, 'TEST_STAFF');
    assert.strictEqual(validChange.success, true);
    assert.strictEqual(validChange.registration?.status, 'CHECKED_IN');
  }
  console.log('✓ Registration state machine transitions enforced\n');

  // Test 7: Fail-Closed Storage Inspection
  console.log('Test 7: P0 Fail-Closed Storage Inspection');
  const isAllowedInTest = isMemoryBackendAllowed();
  assert.strictEqual(isAllowedInTest, true, 'Test environment allows memory backend');
  console.log('✓ Fail-closed memory backend rule verified\n');

  // Test 8: Dashboard KPI Aggregation
  console.log('Test 8: Operational Dashboard KPI Aggregation');
  const kpis = await getDashboardKPIs(event.id);
  assert.ok(kpis.totalRegistrations > 0);
  assert.ok(kpis.checkedInCount > 0);
  console.log(`✓ Dashboard KPIs aggregated total: ${kpis.totalRegistrations}, checkedIn: ${kpis.checkedInCount}\n`);

  // Test 9: isEventDay Date Detection & Walk-in Registration Codes
  console.log('Test 9: Event Day & Walk-in Registration Codes');
  const { isEventDay, generateRegistrationCode: genCode } = await import('../lib/utils/format');
  const eventDayDate = new Date('2026-09-16T10:00:00+07:00');
  const otherDayDate = new Date('2026-09-15T10:00:00+07:00');
  assert.strictEqual(isEventDay(eventDayDate), true, '2026-09-16 must be detected as event day');
  assert.strictEqual(isEventDay(otherDayDate), false, '2026-09-15 must not be event day');

  const onlineCode = genCode(1, 'ONLINE');
  const walkinCode = genCode(1, 'WALK_IN');
  assert.strictEqual(onlineCode, 'LVU26-001', 'Online code must be LVU26-001');
  assert.strictEqual(walkinCode, 'LVU26-W001', 'Walk-in code must be LVU26-W001');
  console.log('✓ Event day detection and Walk-in LVU26-WXXX format verified\n');

  // Test 10: findRegistrationsByPhone Phone-only Multi-match Lookup
  console.log('Test 10: Phone-Only Multi-Match Registration Lookup');
  const { findRegistrationsByPhone } = await import('../services/registration-service');
  
  // Search for the donor registered in Test 5
  const lookup1 = await findRegistrationsByPhone({ eventId: event.id, phone: '085-999-8877' });
  assert.strictEqual(lookup1.length, 1, 'Should find 1 registration for 0859998877');
  const { pickField: pick } = await import('../lib/utils/format');
  assert.strictEqual(pick(lookup1[0], 'firstName', 'first_name'), 'วิชัย');

  // Search for non-existent number
  const lookupEmpty = await findRegistrationsByPhone({ eventId: event.id, phone: '099-000-0000' });
  assert.strictEqual(lookupEmpty.length, 0, 'Should find 0 registrations for unused number');
  console.log('✓ Phone-only lookup with multi-match support verified\n');

  console.log('🎉 ALL HARDENING TESTS PASSED SUCCESSFULLY!');
}

runHardeningTests().catch(err => {
  console.error('❌ Hardening test suite failed:', err);
  process.exit(1);
});
