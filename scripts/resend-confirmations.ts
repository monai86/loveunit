// CLI Tool to safely resend registration confirmation emails without modifying registrations or queue order
// Usage:
//   npx tsx scripts/resend-confirmations.ts --dry-run
//   npx tsx scripts/resend-confirmations.ts --send
//   npx tsx scripts/resend-confirmations.ts --code=MUMT-0001 --send

import { loadEnvLocal } from './lib/env';

loadEnvLocal();

async function main() {
  const args = process.argv.slice(2);
  const isSend = args.includes('--send');
  const codeArg = args.find((a) => a.startsWith('--code='))?.split('=')[1]?.trim();

  const { db } = await import('../db');
  const { registrations, events, timeSlots } = await import('../db/schema');
  const { eq, and, ne, isNotNull } = await import('drizzle-orm');
  const { sendRegistrationConfirmation, isSmtpConfigured } = await import('../services/email-service');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💌 MUMT LoveUnit 2026 — Resend Registration Confirmation Emails');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📡 SMTP Configured: ${isSmtpConfigured() ? '✅ YES' : '❌ NO (Check SMTP_HOST/USER/PASS in .env.local or environment)'}`);
  console.log(`⚙️  Mode: ${isSend ? '🔴 LIVE SEND' : '🟡 DRY-RUN (Preview only, use --send to actually deliver)'}`);
  if (codeArg) {
    console.log(`🎯 Target Code: ${codeArg}`);
  }
  console.log('');

  if (!db) {
    console.error('❌ Database connection not initialized. Please ensure DATABASE_URL is set.');
    process.exit(1);
  }

  // Fetch all active registrations with valid email
  const query = db
    .select({
      id: registrations.id,
      registrationCode: registrations.registrationCode,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      phone: registrations.phone,
      email: registrations.email,
      faculty: registrations.faculty,
      qrToken: registrations.qrToken,
      accessToken: registrations.accessToken,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      slotStartAt: timeSlots.startAt,
      slotEndAt: timeSlots.endAt,
      eventName: events.name,
      venueName: events.venueName,
    })
    .from(registrations)
    .leftJoin(timeSlots, eq(registrations.slotId, timeSlots.id))
    .leftJoin(events, eq(registrations.eventId, events.id))
    .where(
      and(
        ne(registrations.status, 'CANCELLED'),
        isNotNull(registrations.email),
        codeArg ? eq(registrations.registrationCode, codeArg) : undefined
      )
    );

  const records = await query;

  const validDonors = records.filter((r) => r.email && r.email.trim().length > 0);

  console.log(`📋 Found ${validDonors.length} active registration(s) with email address.\n`);

  if (validDonors.length === 0) {
    console.log('No eligible registrations found.');
    process.exit(0);
  }

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < validDonors.length; i++) {
    const donor = validDonors[i];
    const emailTo = donor.email!.trim();

    console.log(`[${i + 1}/${validDonors.length}] ${donor.registrationCode} | ${donor.firstName} ${donor.lastName} <${emailTo}>`);

    if (!isSend) {
      console.log(`   -> [DRY-RUN] Would send confirmation to ${emailTo}`);
      skippedCount++;
      continue;
    }

    if (!isSmtpConfigured()) {
      console.error('   -> [FAILED] SMTP credentials not set. Cannot send.');
      failedCount++;
      continue;
    }

    try {
      const result = await sendRegistrationConfirmation({
        to: emailTo,
        firstName: donor.firstName,
        lastName: donor.lastName,
        phone: donor.phone,
        faculty: donor.faculty,
        registrationCode: donor.registrationCode,
        qrToken: donor.qrToken,
        accessToken: donor.accessToken,
        slot: donor.slotStartAt && donor.slotEndAt ? {
          startAt: donor.slotStartAt.toISOString(),
          endAt: donor.slotEndAt.toISOString(),
        } : null,
        venueName: donor.venueName || 'อาคารวิทยาศาสตร์และเทคโนโลยีการแพทย์ ม.มหิดล ศาลายา',
        eventDateLabel: 'พุธ 16 กันยายน 2569 (09:00 – 14:00 น.)',
      });

      if (result.status === 'sent') {
        console.log(`   -> ✅ SENT successfully to ${emailTo}`);
        sentCount++;
      } else if (result.status === 'skipped') {
        console.log(`   -> ⚠️ SKIPPED (${result.reason})`);
        skippedCount++;
      } else {
        console.log(`   -> ❌ FAILED: ${result.error}`);
        failedCount++;
      }

      // Small throttle delay (300ms) between sends to prevent SMTP rate limits
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`   -> ❌ ERROR:`, err);
      failedCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary: Total: ${validDonors.length} | Sent: ${sentCount} | Skipped: ${skippedCount} | Failed: ${failedCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
