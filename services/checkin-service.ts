import { db } from '@/db';
import { registrations, checkinEvents, timeSlots } from '@/db/schema';
import { eq, and, or, ne, ilike, sql } from 'drizzle-orm';
import { normalizePhoneNumber, isRegistrationEligibleForSouvenir, getSouvenirEligibilityDetails, isWalkInRecord, type SouvenirCandidate } from '@/lib/utils/format';
import { isTransitionAllowed } from '@/lib/db/store';
import { isMemoryBackendAllowed, searchRegistrations as memorySearch, updateRegistrationStatus as memoryUpdateStatus, cancelRegistration as memoryCancelRegistration } from '@/lib/db/store';
import { resolveActorId } from '@/lib/auth/server';
import { RegistrationStatus } from '@/lib/types/database';
import { promoteFromWaitlist } from '@/services/waitlist-service';

// Short TTL cache for souvenir ranking to avoid querying all records per scan keystroke
let souvenirRankingCache: { eventId: string; expiresAt: number; regs: SouvenirCandidate[] } | null = null;

export function invalidateSouvenirCache() {
  souvenirRankingCache = null;
}

async function getAllCandidates(eventId: string): Promise<SouvenirCandidate[]> {
  const now = Date.now();
  if (souvenirRankingCache && souvenirRankingCache.eventId === eventId && now < souvenirRankingCache.expiresAt) {
    return souvenirRankingCache.regs;
  }
  if (!db) return [];
  const candidates = await db.query.registrations.findMany({
    where: and(
      eq(registrations.eventId, eventId),
      ne(registrations.status, 'CANCELLED')
    ),
    with: {
      timeSlot: true,
    },
  });
  souvenirRankingCache = { eventId, expiresAt: now + 3000, regs: candidates };
  return candidates;
}

export async function searchRegistrations(query: string) {
  const q = query.trim();
  if (!q) return [];

  if (db) {
    const normPhone = normalizePhoneNumber(q);
    const nameParts = q.split(/\s+/).filter(Boolean);
    const conditions = [
      eq(registrations.qrToken, q),
      eq(registrations.registrationCode, q.toUpperCase()),
      ilike(registrations.registrationCode, `%${q}%`),
      ilike(registrations.firstName, `%${q}%`),
      ilike(registrations.lastName, `%${q}%`),
      sql`lower(${registrations.firstName} || ' ' || ${registrations.lastName}) ILIKE ${`%${q.toLowerCase()}%`}`,
      ilike(registrations.phone, `%${q}%`),
      normPhone.length >= 3 ? ilike(registrations.phoneNormalized, `%${normPhone}%`) : undefined,
    ];

    if (nameParts.length >= 2) {
      conditions.push(
        and(
          ilike(registrations.firstName, `%${nameParts[0]}%`),
          ilike(registrations.lastName, `%${nameParts.slice(1).join(' ')}%`)
        )
      );
    }

    const matched = await db.query.registrations.findMany({
      where: or(...conditions.filter(Boolean)),
      limit: 50,
      with: {
        timeSlot: true,
      },
    });

    if (matched.length === 0) return [];

    const eventId = matched[0].eventId;
    const allCandidates = await getAllCandidates(eventId);

    return matched.map((r) => {
      const isEligible = isRegistrationEligibleForSouvenir(r, allCandidates, 100);
      const souvenirDetails = getSouvenirEligibilityDetails(r, allCandidates, 100, 100);
      return {
        ...r,
        isWalkIn: isWalkInRecord(r),
        souvenirEligible: isEligible,
        souvenirDetails,
      };
    });
  }

  if (isMemoryBackendAllowed()) {
    return await memorySearch(query);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function updateRegistrationStatus(
  registrationId: string,
  targetStatus: RegistrationStatus,
  performedBy?: string
) {
  invalidateSouvenirCache();
  if (db) {
    const [current] = await db
      .select({ status: registrations.status, eventId: registrations.eventId })
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!current) {
      return { success: false, message: 'ไม่พบข้อมูลการลงทะเบียน' };
    }

    if (!isTransitionAllowed(current.status as RegistrationStatus, targetStatus)) {
      return {
        success: false,
        message: `ไม่สามารถเปลี่ยนสถานะจาก "${current.status}" เป็น "${targetStatus}" ได้`,
      };
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {
      status: targetStatus,
      updatedAt: now,
    };
    if (targetStatus === 'CHECKED_IN') updateData.checkedInAt = now;
    if (targetStatus === 'COMPLETED') updateData.completedAt = now;

    // Status change + audit log must commit atomically: never leave a status
    // updated without a corresponding audit trail.
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(registrations)
        .set(updateData)
        .where(eq(registrations.id, registrationId))
        .returning();

      await tx.insert(checkinEvents).values({
        eventId: current.eventId,
        registrationId: registrationId,
        action: `STATUS_CHANGE_${targetStatus}`,
        performedBy: resolveActorId(performedBy),
      });

      return row;
    });

    return { success: true, registration: updated };
  }

  if (isMemoryBackendAllowed()) {
    return await memoryUpdateStatus(registrationId, targetStatus, performedBy);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function checkInDonor(registrationId: string, performedBy?: string) {
  return updateRegistrationStatus(registrationId, 'CHECKED_IN', performedBy);
}

/**
 * Cancels a donor's registration and frees their time-slot seat:
 *
 *   1. Atomically (single transaction): status → CANCELLED, audit event, and
 *      booked_count − 1 on the slot the registration held (never below 0).
 *   2. After the cancel commits, promotes the next WAITING donor for that slot
 *      (FIFO) into the freed seat — see promoteFromWaitlist. A concurrent
 *      registration that claims the seat first makes the promotion fail
 *      gracefully (the waitlist entry stays WAITING).
 *
 * Only statuses the state machine allows to reach CANCELLED are cancellable
 * (REGISTERED, CHECKED_IN, IN_PROCESS, NO_SHOW — COMPLETED never is). Every
 * cancellable status holds a seat, so the capacity is always released.
 */
export async function cancelRegistration(
  registrationId: string,
  performedBy?: string,
  reason?: string
) {
  if (db) {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(registrations)
        .where(eq(registrations.id, registrationId))
        .limit(1);

      if (!current) return { success: false as const, message: 'ไม่พบข้อมูลการลงทะเบียน' };

      if (!isTransitionAllowed(current.status as RegistrationStatus, 'CANCELLED')) {
        return {
          success: false as const,
          message: `ไม่สามารถยกเลิกรายการที่มีสถานะ "${current.status}" ได้`,
        };
      }

      const [row] = await tx
        .update(registrations)
        .set({ status: 'CANCELLED', updatedAt: new Date() })
        .where(eq(registrations.id, registrationId))
        .returning();

      // Release the seat the registration held (clamped so an inconsistent
      // zero count can never go negative).
      if (current.slotId) {
        await tx
          .update(timeSlots)
          .set({ bookedCount: sql`GREATEST(${timeSlots.bookedCount} - 1, 0)` })
          .where(and(eq(timeSlots.id, current.slotId), eq(timeSlots.eventId, current.eventId)));
      }

      await tx.insert(checkinEvents).values({
        eventId: current.eventId,
        registrationId,
        action: 'STATUS_CHANGE_CANCELLED',
        performedBy: resolveActorId(performedBy),
        metadata: {
          ...(reason ? { reason } : {}),
          actor: performedBy || 'DONOR_SELF',
        },
      });

      return {
        success: true as const,
        registration: row,
        eventId: current.eventId,
        slotId: current.slotId,
      };
    });

    // Seat freed — promote the next waiting donor (FIFO) if any. Runs after the
    // cancel commits so it can lock the slot with its own FOR UPDATE (nested
    // transactions on separate connections would deadlock on the row lock).
    if (result.success && result.slotId) {
      const promoted = await promoteFromWaitlist(result.slotId, result.eventId);
      if (promoted.success) {
        return { ...result, promoted: { registration: promoted.registration, entry: promoted.entry } };
      }
    }
    return result;
  }

  if (isMemoryBackendAllowed()) {
    const cancelled = await memoryCancelRegistration(registrationId, performedBy, reason);
    if (!cancelled.success || !cancelled.slotId) return cancelled;
    const promoted = await promoteFromWaitlist(cancelled.slotId, cancelled.eventId || '');
    if (promoted.success) {
      return { ...cancelled, promoted: { registration: promoted.registration, entry: promoted.entry } };
    }
    return cancelled;
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}
