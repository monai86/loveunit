import { db } from '@/db';
import { registrations, timeSlots, events } from '@/db/schema';
import { eq, and, ne, sql } from 'drizzle-orm';
import { normalizePhoneNumber, generateRegistrationCode, generateQRToken } from '@/lib/utils/format';
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

      // 2. Lock & Check Slot Capacity
      if (input.slotId) {
        const slotResult = await tx.execute(
          sql`SELECT capacity, booked_count FROM time_slots WHERE id = ${input.slotId} AND event_id = ${input.eventId} AND is_active = TRUE FOR UPDATE`
        );
        const slotRow = slotResult.rows[0] as { capacity: number; booked_count: number } | undefined;

        if (!slotRow) {
          return { success: false, errorCode: 'SLOT_NOT_FOUND', message: 'ไม่พบช่วงเวลาที่เลือก' };
        }

        if (slotRow.booked_count >= slotRow.capacity) {
          return { success: false, errorCode: 'SLOT_FULL', message: 'ช่วงเวลานี้เพิ่งเต็ม กรุณาเลือกช่วงเวลาอื่น' };
        }

        // Increment booked_count
        await tx
          .update(timeSlots)
          .set({ bookedCount: sql`${timeSlots.bookedCount} + 1` })
          .where(eq(timeSlots.id, input.slotId));
      }

      // 3. Create Registration Record
      const code = generateRegistrationCode();
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
          participantType: input.participantType as any,
          faculty: input.faculty || null,
          academicYear: input.academicYear || null,
          donationExperience: input.donationExperience as any,
          slotId: input.slotId || null,
          status: 'REGISTERED',
          source: source as any,
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
