import { db } from '@/db';
import { registrations, checkinEvents } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';
import { normalizePhoneNumber } from '@/lib/utils/format';
import { isTransitionAllowed } from '@/lib/db/store';
import { isMemoryBackendAllowed, searchRegistrations as memorySearch, updateRegistrationStatus as memoryUpdateStatus } from '@/lib/db/store';
import { resolveActorId } from '@/lib/auth/server';
import { RegistrationStatus } from '@/lib/types/database';

export async function searchRegistrations(query: string) {
  const q = query.trim();
  if (!q) return [];

  if (db) {
    const normPhone = normalizePhoneNumber(q);
    return await db.query.registrations.findMany({
      where: or(
        ilike(registrations.registrationCode, `%${q}%`),
        ilike(registrations.firstName, `%${q}%`),
        ilike(registrations.lastName, `%${q}%`),
        ilike(registrations.phone, `%${q}%`),
        normPhone.length >= 4 ? ilike(registrations.phoneNormalized, `%${normPhone}%`) : undefined
      ),
      limit: 50,
      with: {
        timeSlot: true,
      },
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
