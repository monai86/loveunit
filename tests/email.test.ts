import assert from 'node:assert';

async function runEmailTests() {
  console.log('✉️  Running donor confirmation email tests...\n');

  const { buildDonorConfirmationEmail } = await import('../services/email-service');
  const email = await buildDonorConfirmationEmail({
    to: 'donor@example.com',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    registrationCode: 'LVU26-ABC123',
    qrToken: 'LVU26_QR_LVU26-ABC123_random-token',
    slot: { startAt: '2026-09-16T02:00:00.000Z', endAt: '2026-09-16T02:30:00.000Z' },
    venueName: 'ห้องประชุม 217 อาคารสิริวิทยา',
    eventDateLabel: 'พุธ 16 กันยายน 2569',
  });

  assert.match(email.subject, /ยืนยันการลงทะเบียน/);
  assert.match(email.subject, /Registration Confirmation/);
  assert.match(email.html, /ขอบคุณที่ร่วมลงทะเบียน/);
  assert.match(email.html, /Thank you for registering/);
  assert.match(email.html, /สมชาย ใจดี/);
  assert.match(email.html, /ห้องประชุม 217 อาคารสิริวิทยา/);
  assert.match(email.html, /LVU26-ABC123/);
  assert.strictEqual(email.attachments.length, 2, 'email must include QR code and event poster attachments');
  assert.strictEqual(email.attachments[0].cid, 'donor-qr-code');
  assert.strictEqual(email.attachments[1].cid, 'event-poster');
  assert.match(email.html, /cid:donor-qr-code/);
  assert.match(email.html, /cid:event-poster/);
  assert.ok(Buffer.isBuffer(email.attachments[0].content), 'QR attachment must be a binary image');
  assert.ok(Buffer.isBuffer(email.attachments[1].content), 'poster attachment must be a binary image');
  console.log('✓ Thank-you email includes event details and donor QR code\n');
}

runEmailTests().catch((error) => {
  console.error('❌ Donor confirmation email tests failed:', error);
  process.exit(1);
});
