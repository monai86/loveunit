import { and, eq, isNotNull, ne } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs, registrations, timeSlots } from '@/db/schema';
import { sendDonorPreparationReminder } from '@/services/email-service';
import { EVENT_CONFIG, getFormattedVenue } from '@/lib/constants/event';

const REMINDER_ACTION = 'DONOR_PREPARATION_REMINDER_SENT';

export async function sendPreparationRemindersForEvent(eventId: string) {
  if (!db) throw new Error('DATABASE_URL is unconfigured in production environment.');

  const recipients = await db
    .select({
      id: registrations.id,
      email: registrations.email,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      registrationCode: registrations.registrationCode,
      qrToken: registrations.qrToken,
      startAt: timeSlots.startAt,
      endAt: timeSlots.endAt,
    })
    .from(registrations)
    .leftJoin(timeSlots, eq(registrations.slotId, timeSlots.id))
    .where(and(
      eq(registrations.eventId, eventId),
      isNotNull(registrations.email),
      ne(registrations.status, 'CANCELLED'),
    ));

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const alreadySent = await db
      .select({ id: auditLogs.id })
      .from(auditLogs)
      .where(and(
        eq(auditLogs.action, REMINDER_ACTION),
        eq(auditLogs.entityType, 'registration'),
        eq(auditLogs.entityId, recipient.id),
      ))
      .limit(1);

    if (alreadySent.length > 0) {
      skipped += 1;
      continue;
    }

    const delivery = await sendDonorPreparationReminder({
      to: recipient.email || '',
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      registrationCode: recipient.registrationCode,
      qrToken: recipient.qrToken,
      slot: recipient.startAt && recipient.endAt ? { startAt: recipient.startAt.toISOString(), endAt: recipient.endAt.toISOString() } : null,
      venueName: getFormattedVenue('th'),
      eventDateLabel: `${EVENT_CONFIG.dateTh} (${EVENT_CONFIG.timeLabelTh})`,
    });

    if (delivery.status !== 'sent') {
      failed += 1;
      console.error('[email] Preparation reminder was not delivered', {
        registrationCode: recipient.registrationCode,
        status: delivery.status,
      });
      continue;
    }

    await db.insert(auditLogs).values({
      action: REMINDER_ACTION,
      entityType: 'registration',
      entityId: recipient.id,
      metadata: { registrationCode: recipient.registrationCode, email: recipient.email },
    });
    sent += 1;
  }

  return { recipients: recipients.length, sent, skipped, failed };
}
