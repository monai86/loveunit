import assert from 'node:assert';

async function runEmailTests() {
  console.log('✉️  Running donor confirmation email tests...\n');

  const { buildDonorConfirmationEmail, buildDonorPreparationReminderEmail, sendRegistrationConfirmation } = await import('../services/email-service');
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
  assert.match(email.html, /การลงทะเบียนของคุณเรียบร้อยแล้ว/);
  assert.match(email.html, /Registration confirmed/);
  assert.match(email.html, /สมชาย ใจดี/);
  assert.match(email.html, /ห้องประชุม 217 อาคารสิริวิทยา/);
  assert.match(email.html, /LVU26-ABC123/);
  assert.match(email.html, /ข้อมูลการนัดหมาย/);
  assert.match(email.html, /Appointment Details/);
  assert.match(email.html, /อย่าลืมนำบัตรประชาชนมาด้วย/);
  assert.match(email.html, /Preparation Tips/);
  assert.match(email.html, /role="presentation"/);
  assert.strictEqual(email.attachments.length, 1, 'email should attach only the check-in QR image');
  assert.strictEqual(email.attachments[0].cid, 'donor-qr-code');
  assert.match(email.html, /cid:donor-qr-code/);
  assert.ok(Buffer.isBuffer(email.attachments[0].content), 'QR attachment must be a binary image');
  console.log('✓ Thank-you email includes event details and donor QR code\n');

  const reminder = await buildDonorPreparationReminderEmail({
    to: 'donor@example.com',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    registrationCode: 'LVU26-ABC123',
    qrToken: 'LVU26_QR_LVU26-ABC123_random-token',
    slot: { startAt: '2026-09-16T02:00:00.000Z', endAt: '2026-09-16T02:30:00.000Z' },
    venueName: 'ห้องประชุม 217 อาคารสิริวิทยา',
    eventDateLabel: 'พุธ 16 กันยายน 2569',
  });
  assert.match(reminder.subject, /เตือนความพร้อมก่อนวันบริจาคโลหิต/);
  assert.match(reminder.html, /อย่าลืมนำบัตรประชาชนมาด้วย/);
  assert.match(reminder.html, /LVU26-ABC123/);
  assert.match(reminder.html, /พุธ 16 กันยายน 2569/);
  assert.match(reminder.html, /2 Days to Go/);
  assert.match(reminder.html, /4-Step Readiness Checklist/);
  assert.match(reminder.html, /cid:donor-reminder-qr-code/);
  assert.strictEqual(reminder.attachments.length, 1, 'reminder should attach the donor QR image');
  console.log('✓ Preparation reminder includes the appointment and required identity document\n');

  const smtpVariables = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const;
  const originalSmtp = Object.fromEntries(smtpVariables.map((key) => [key, process.env[key]]));
  for (const key of smtpVariables) delete process.env[key];

  const skipped = await sendRegistrationConfirmation({
    to: 'donor@example.com',
    firstName: 'Donor',
    lastName: 'Example',
    registrationCode: 'LVU26-002',
  });

  assert.strictEqual(skipped.status, 'skipped');

  for (const key of smtpVariables) {
    if (originalSmtp[key]) process.env[key] = originalSmtp[key];
  }
  console.log('✓ Confirmation delivery reports when SMTP is unavailable\n');
}

runEmailTests().catch((error) => {
  console.error('❌ Donor confirmation email tests failed:', error);
  process.exit(1);
});
