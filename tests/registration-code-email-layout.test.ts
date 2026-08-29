import assert from 'node:assert/strict';
import { nextRegistrationSequence } from '../lib/utils/format';

async function runTests() {
  console.log('🧾 Running registration code and email layout tests...');

  assert.equal(nextRegistrationSequence(['LVU26-001', 'LVU26-006']), 7);
  assert.equal(nextRegistrationSequence(['LVU26-001', 'LVU26-006', 'LVU26-007']), 8);
  assert.equal(nextRegistrationSequence([]), 1);

  const { buildDonorConfirmationEmail } = await import('../services/email-service');
  const email = await buildDonorConfirmationEmail({
    to: 'donor@example.com',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    registrationCode: 'LVU26-008',
    qrToken: 'LVU26_QR_LVU26-008_test',
  });

  assert.match(email.html, /ข้อมูลการนัดหมาย/);
  assert.match(email.html, /แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน/);
  assert.match(email.html, /role="presentation"/);
  assert.match(email.html, /table-layout:fixed/);
  assert.match(email.html, /max-width:600px/);

  console.log('✓ Registration sequence and mobile email layout are stable');
}

runTests().catch((error) => {
  console.error('❌ Registration code/email layout tests failed:', error);
  process.exit(1);
});
