process.env.DATA_BACKEND = 'memory';
// @ts-expect-error test-only environment override
process.env.NODE_ENV = 'test';

import assert from 'node:assert';
import { defaultSlots, inMemoryRegistrations } from '../lib/db/store';
import { inMemoryWaitlist } from '../services/waitlist-service';

async function run() {
  const { resetTestData } = await import('../services/test-data-service');
  assert.ok(inMemoryRegistrations.length > 0);
  defaultSlots[0].booked_count = 99;
  inMemoryWaitlist.push({ id: 'reset-test', event_id: defaultSlots[0].event_id, slot_id: defaultSlots[0].id, first_name: 'ทดสอบ', last_name: 'ล้าง', phone: '0800000000', phone_normalized: '0800000000', status: 'WAITING', created_at: new Date().toISOString(), notified_at: null, promoted_registration_id: null });
  const result = await resetTestData('u-primary-admin');
  assert.strictEqual(result.deletedRegistrations, 2);
  assert.strictEqual(result.deletedWaitlist, 1);
  assert.strictEqual(inMemoryRegistrations.length, 0);
  assert.strictEqual(inMemoryWaitlist.length, 0);
  assert.strictEqual(defaultSlots.every((slot) => slot.booked_count === 0), true);
  console.log('✓ test registrations and waitlist reset; slot counters restart at zero');
}

run().catch((error) => { console.error(error); process.exit(1); });
