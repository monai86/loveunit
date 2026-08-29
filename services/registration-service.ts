import { db } from '@/db';
import { registrations, timeSlots } from '@/db/schema';
import { eq, and, ne, sql, ilike } from 'drizzle-orm';
import { normalizePhoneNumber, generateRegistrationCode, generateQRToken, nextRegistrationSequence } from '@/lib/utils/format';
import { isMemoryBackendAllowed, registerDonorAtomic as memoryRegisterAtomic, inMemoryRegistrations, defaultSlots, defaultEvent } from '@/lib/db/store';
import { ParticipantType, DonationExperience, RegistrationSource } from '@/lib/types/database';

export async function registerDonorAtomic(input: {
  eventId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  participantType: ParticipantType;
  faculty?: string;
  academicYear?: string;
  donationExperience: DonationExperience;
  slotId: string;
  source?: RegistrationSource;
}) {
  const phoneNormalized = normalizePhoneNumber(input.phone);
  const source = input.source || 'ONLINE';

  if (db) {
    return await db.transaction(async (tx) => {
      // 1. Check duplicate normalized phone
      const existing = await tx
        .select()
        .from(registrations)
        .where(
          and(
            eq(registrations.eventId, input.eventId),
            eq(registrations.phoneNormalized, phoneNormalized),
            ne(registrations.status, 'CANCELLED')
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          errorCode: 'DUPLICATE_REGISTRATION',
          message: 'พบการลงทะเบียนสำหรับหมายเลขโทรศัพท์นี้แล้ว',
          registration: existing[0],
        };
      }

      // 2. Validate the selected arrival window and retain a count for reports.
      // Arrival windows intentionally have no registration capacity limit.
      if (input.slotId) {
        const slotResult = await tx.execute(
          sql`SELECT id FROM time_slots WHERE id = ${input.slotId} AND event_id = ${input.eventId} AND is_active = TRUE FOR UPDATE`
        );
        const slotRow = slotResult.rows[0] as { id: string } | undefined;

        if (!slotRow) {
          return { success: false, errorCode: 'SLOT_NOT_FOUND', message: 'ไม่พบช่วงเวลาที่เลือก' };
        }

        // Increment booked_count for staff reporting only; it is not a limit.
        await tx
          .update(timeSlots)
          .set({ bookedCount: sql`${timeSlots.bookedCount} + 1` })
          .where(eq(timeSlots.id, input.slotId));
      }

      // 3. Create a monotonic event code. Lock per event so concurrent requests
      // cannot receive the same number, and never reuse a deleted code.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${input.eventId}))`);
      const codeRows = await tx.execute(
        sql`SELECT registration_code FROM registrations WHERE event_id = ${input.eventId}`
      );
      const nextSeq = nextRegistrationSequence(codeRows.rows.map((row) => String(row.registration_code)));
      const code = generateRegistrationCode(nextSeq);
      const token = generateQRToken(code);

      const [newReg] = await tx
        .insert(registrations)
        .values({
          eventId: input.eventId,
          registrationCode: code,
          qrToken: token,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          phoneNormalized: phoneNormalized,
          email: input.email || null,
          participantType: input.participantType as ParticipantType,
          faculty: input.faculty || null,
          academicYear: input.academicYear || null,
          donationExperience: input.donationExperience as DonationExperience,
          slotId: input.slotId || null,
          status: 'REGISTERED',
          source: source as RegistrationSource,
          privacyAccepted: true,
        })
        .returning();

      return { success: true, registration: newReg };
    });
  }

  if (isMemoryBackendAllowed()) {
    return await memoryRegisterAtomic(input);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getRegistrationByCode(code: string) {
  const codeClean = code.trim().toUpperCase();

  if (db) {
    const result = await db.query.registrations.findFirst({
      where: eq(registrations.registrationCode, codeClean),
      with: {
        timeSlot: true,
        event: true,
      },
    });
    return result || null;
  }

  if (isMemoryBackendAllowed()) {
    const reg = inMemoryRegistrations.find(r => r.registration_code.toUpperCase() === codeClean);
    if (!reg) return null;
    return { ...reg, time_slot: defaultSlots.find(s => s.id === reg.slot_id) || null, event: defaultEvent };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getRegistrationByQRToken(token: string) {
  const tokenClean = token.trim();

  if (db) {
    const result = await db.query.registrations.findFirst({
      where: eq(registrations.qrToken, tokenClean),
      with: {
        timeSlot: true,
      },
    });
    return result || null;
  }

  if (isMemoryBackendAllowed()) {
    const reg = inMemoryRegistrations.find(r => r.qr_token === tokenClean);
    if (!reg) return null;
    return { ...reg, time_slot: defaultSlots.find(s => s.id === reg.slot_id) || null };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

/**
 * Looks up a donor's registration using phone + first/last name verification.
 * Used by the public "ลืม QR Code" recovery page. Returns the full registration
 * (with timeSlot/event relations) or null when nothing matches.
 */
export async function findRegistrationByPhoneAndName(input: {
  eventId: string;
  phone: string;
  firstName: string;
  lastName: string;
}) {
  const phoneNormalized = normalizePhoneNumber(input.phone);

  if (db) {
    const result = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.eventId, input.eventId),
        eq(registrations.phoneNormalized, phoneNormalized),
        ne(registrations.status, 'CANCELLED'),
        ilike(registrations.firstName, input.firstName.trim()),
        ilike(registrations.lastName, input.lastName.trim()),
      ),
      with: {
        timeSlot: true,
        event: true,
      },
      orderBy: (regs, { desc }) => [desc(regs.registeredAt)],
    });
    return result || null;
  }

  if (isMemoryBackendAllowed()) {
    const reg = inMemoryRegistrations.find(
      r =>
        r.event_id === input.eventId &&
        r.phone_normalized === phoneNormalized &&
        r.first_name === input.firstName.trim() &&
        r.last_name === input.lastName.trim() &&
        r.status !== 'CANCELLED'
    );
    if (!reg) return null;
    return { ...reg, time_slot: defaultSlots.find(s => s.id === reg.slot_id) || null, event: defaultEvent };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}
