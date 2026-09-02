import { db } from '@/db';
import { registrations, timeSlots, verificationTokens } from '@/db/schema';
import { eq, and, ne, sql, ilike } from 'drizzle-orm';
import { normalizePhoneNumber, generateRegistrationCode, generateQRToken, generateAccessToken } from '@/lib/utils/format';
import {
  isMemoryBackendAllowed,
  registerDonorAtomic as memoryRegisterAtomic,
  getRegistrationByAccessToken as memoryGetRegistrationByAccessToken,
  createVerificationToken as memoryCreateVerificationToken,
  consumeVerificationToken as memoryConsumeVerificationToken,
  inMemoryRegistrations,
  defaultSlots,
  defaultEvent
} from '@/lib/db/store';
import { ParticipantType, DonationExperience, RegistrationSource } from '@/lib/types/database';

const isDbActive = () => Boolean(db && process.env.DATA_BACKEND !== 'memory');

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
  prChannel?: string | null;
  slotId: string;
  source?: RegistrationSource;
}) {
  const phoneNormalized = normalizePhoneNumber(input.phone);
  const source = input.source || 'ONLINE';

  if (isDbActive() && db) {
    return await db.transaction(async (tx) => {
      // 1. Acquire event-level advisory transaction lock to guarantee deterministic ordering
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${input.eventId}))`);

      // 2. Check duplicate normalized phone
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

      // 3. Validate the selected arrival window and retain a count for reports.
      if (input.slotId) {
        const slotResult = await tx.execute(
          sql`SELECT id FROM time_slots WHERE id = ${input.slotId} AND event_id = ${input.eventId} AND is_active = TRUE FOR UPDATE`
        );
        const slotRow = slotResult.rows[0] as { id: string } | undefined;

        if (!slotRow) {
          return { success: false, errorCode: 'SLOT_NOT_FOUND', message: 'ไม่พบช่วงเวลาที่เลือก' };
        }

        await tx
          .update(timeSlots)
          .set({ bookedCount: sql`${timeSlots.bookedCount} + 1` })
          .where(eq(timeSlots.id, input.slotId));
      }

      // 4. Create a monotonic event code separated by source (Online vs Walk-in).
      let nextSeq = 1;
      if (source === 'WALK_IN') {
        const maxSeqResult = await tx.execute(
          sql`SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(registration_code, '^LVU26-W', '', 'i'), '') AS integer)), 0) AS max_seq FROM registrations WHERE event_id = ${input.eventId} AND registration_code ILIKE 'LVU26-W%'`
        );
        const maxSeq = Number((maxSeqResult.rows[0] as { max_seq?: number | string })?.max_seq ?? 0);
        nextSeq = maxSeq + 1;
      } else {
        const maxSeqResult = await tx.execute(
          sql`SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(registration_code, '^LVU26-(?!W)', '', 'i'), '') AS integer)), 0) AS max_seq FROM registrations WHERE event_id = ${input.eventId} AND registration_code ~ '^LVU26-[0-9]+$'`
        );
        const maxSeq = Number((maxSeqResult.rows[0] as { max_seq?: number | string })?.max_seq ?? 0);
        nextSeq = maxSeq + 1;
      }

      const code = generateRegistrationCode(nextSeq, source);
      const token = generateQRToken();
      const accessToken = generateAccessToken();

      const [newReg] = await tx
        .insert(registrations)
        .values({
          eventId: input.eventId,
          registrationCode: code,
          qrToken: token,
          accessToken: accessToken,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          phoneNormalized: phoneNormalized,
          email: input.email || null,
          participantType: input.participantType as ParticipantType,
          faculty: input.faculty || null,
          academicYear: input.academicYear || null,
          donationExperience: input.donationExperience as DonationExperience,
          prChannel: input.prChannel || null,
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

export async function getRegistrationByAccessToken(token: string) {
  const tokenClean = token.trim();
  if (!tokenClean) return null;

  if (isDbActive() && db) {
    const result = await db.query.registrations.findFirst({
      where: eq(registrations.accessToken, tokenClean),
      with: {
        timeSlot: true,
        event: true,
      },
    });
    return result || null;
  }

  if (isMemoryBackendAllowed()) {
    return await memoryGetRegistrationByAccessToken(tokenClean);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function createVerificationToken(registrationId: string, contactTarget: string): Promise<string> {
  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  if (isDbActive() && db) {
    await db.insert(verificationTokens).values({
      registrationId,
      token,
      contactTarget,
      expiresAt,
    });
    return token;
  }

  if (isMemoryBackendAllowed()) {
    return await memoryCreateVerificationToken(registrationId, contactTarget);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function consumeVerificationToken(token: string) {
  const tokenClean = token.trim();
  if (!tokenClean) return null;

  if (isDbActive() && db) {
    const now = new Date();
    const [vt] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, tokenClean),
          sql`${verificationTokens.usedAt} IS NULL`,
          sql`${verificationTokens.expiresAt} > ${now}`
        )
      )
      .limit(1);

    if (!vt) return null;

    await db
      .update(verificationTokens)
      .set({ usedAt: now })
      .where(eq(verificationTokens.id, vt.id));

    const result = await db.query.registrations.findFirst({
      where: eq(registrations.id, vt.registrationId),
      with: {
        timeSlot: true,
        event: true,
      },
    });
    return result || null;
  }

  if (isMemoryBackendAllowed()) {
    return await memoryConsumeVerificationToken(tokenClean);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getRegistrationByCode(code: string) {
  const codeClean = decodeURIComponent(code).trim().toUpperCase();

  if (isDbActive() && db) {
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
    const reg = inMemoryRegistrations.find(
      r => ((r as { registrationCode?: string }).registrationCode || r.registration_code || '').toUpperCase() === codeClean
    );
    if (!reg) return null;
    return { ...reg, time_slot: defaultSlots.find(s => s.id === (reg.slot_id || (reg as { slotId?: string }).slotId)) || null, event: defaultEvent };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getRegistrationByQRToken(token: string) {
  const tokenClean = decodeURIComponent(token).trim();

  if (isDbActive() && db) {
    const result = await db.query.registrations.findFirst({
      where: eq(registrations.qrToken, tokenClean),
      with: {
        timeSlot: true,
      },
    });
    return result || null;
  }

  if (isMemoryBackendAllowed()) {
    const reg = inMemoryRegistrations.find(
      r => ((r as { qrToken?: string }).qrToken || r.qr_token || '').trim() === tokenClean
    );
    if (!reg) return null;
    return { ...reg, time_slot: defaultSlots.find(s => s.id === (reg.slot_id || (reg as { slotId?: string }).slotId)) || null, event: defaultEvent };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function findRegistrationByEmail(input: {
  eventId: string;
  email: string;
}) {
  const emailClean = input.email.trim().toLowerCase();
  if (!emailClean) return null;

  if (isDbActive() && db) {
    const result = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.eventId, input.eventId),
        ilike(registrations.email, emailClean),
        ne(registrations.status, 'CANCELLED')
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
      r => r.event_id === input.eventId && r.email && r.email.toLowerCase() === emailClean && r.status !== 'CANCELLED'
    );
    if (!reg) return null;
    return { ...reg, time_slot: defaultSlots.find(s => s.id === reg.slot_id) || null, event: defaultEvent };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function findRegistrationByPhoneAndName(input: {
  eventId: string;
  phone: string;
  firstName: string;
  lastName: string;
}) {
  const phoneNormalized = normalizePhoneNumber(input.phone);

  if (isDbActive() && db) {
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

export async function findRegistrationsByPhone(input: {
  eventId: string;
  phone: string;
}) {
  const phoneNormalized = normalizePhoneNumber(input.phone);
  if (!phoneNormalized) return [];

  if (isDbActive() && db) {
    const results = await db.query.registrations.findMany({
      where: and(
        eq(registrations.eventId, input.eventId),
        eq(registrations.phoneNormalized, phoneNormalized),
        ne(registrations.status, 'CANCELLED'),
      ),
      with: {
        timeSlot: true,
        event: true,
      },
      orderBy: (regs, { desc }) => [desc(regs.registeredAt)],
    });
    return results || [];
  }

  if (isMemoryBackendAllowed()) {
    const matched = inMemoryRegistrations.filter(
      r =>
        r.event_id === input.eventId &&
        r.phone_normalized === phoneNormalized &&
        r.status !== 'CANCELLED'
    );
    return matched.map(reg => ({
      ...reg,
      time_slot: defaultSlots.find(s => s.id === reg.slot_id) || null,
      event: defaultEvent,
    }));
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}
