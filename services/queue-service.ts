// Queue service — per-time-slot donor queue for the event day. Staff can see
// who is waiting in each slot (oldest first) and "call next" to check someone in.

import { db } from '@/db';
import { registrations, timeSlots } from '@/db/schema';
import { eq, and, inArray, asc } from 'drizzle-orm';
import { isMemoryBackendAllowed, inMemoryRegistrations, defaultSlots } from '@/lib/db/store';
import type { Registration as MemoryRegistration, TimeSlot as MemoryTimeSlot } from '@/lib/types/database';
import { updateRegistrationStatus } from '@/services/checkin-service';

const QUEUE_STATUSES = ['REGISTERED', 'CHECKED_IN', 'IN_PROCESS'] as const;

export interface QueueEntry {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  slotId: string;
  registeredAt: string;
  timeSlot: { startAt: string; endAt: string } | null;
}

/**
 * Returns the per-slot queue: registrations that still need attention
 * (REGISTERED / CHECKED_IN / IN_PROCESS), grouped by slot, oldest first.
 */
export async function getDonorQueue(eventId: string): Promise<QueueEntry[]> {
  if (db) {
    const rows = await db.query.registrations.findMany({
      where: and(
        eq(registrations.eventId, eventId),
        inArray(registrations.status, [...QUEUE_STATUSES])
      ),
      orderBy: [asc(registrations.registeredAt)],
      with: { timeSlot: true },
    });

    return rows.map((r) => ({
      id: r.id,
      registrationCode: r.registrationCode,
      firstName: r.firstName,
      lastName: r.lastName,
      phone: r.phone,
      status: r.status,
      slotId: r.slotId ?? '',
      registeredAt: (r.registeredAt ?? r.createdAt).toISOString(),
      timeSlot: r.timeSlot
        ? { startAt: r.timeSlot.startAt.toISOString(), endAt: r.timeSlot.endAt.toISOString() }
        : null,
    }));
  }

  if (isMemoryBackendAllowed()) {
    return inMemoryRegistrations
      .filter(
        (r: MemoryRegistration) =>
          r.event_id === eventId && QUEUE_STATUSES.includes(r.status as (typeof QUEUE_STATUSES)[number])
      )
      .sort(
        (a: MemoryRegistration, b: MemoryRegistration) =>
          new Date(a.registered_at || a.created_at).getTime() -
          new Date(b.registered_at || b.created_at).getTime()
      )
      .map((r: MemoryRegistration) => {
        const slot = defaultSlots.find((s: MemoryTimeSlot) => s.id === r.slot_id);
        return {
          id: r.id,
          registrationCode: r.registration_code,
          firstName: r.first_name,
          lastName: r.last_name,
          phone: r.phone,
          status: r.status,
          slotId: r.slot_id ?? '',
          registeredAt: r.registered_at || r.created_at || new Date().toISOString(),
          timeSlot: slot
            ? { startAt: slot.start_at, endAt: slot.end_at }
            : null,
        };
      });
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

/**
 * Calls the next donor of a slot: promotes the oldest REGISTERED donor to
 * CHECKED_IN. Returns the promoted donor or null when the slot queue is empty.
 */
export async function callNextDonor(slotId: string, performedBy?: string) {
  if (db) {
    const [next] = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(and(eq(registrations.slotId, slotId), eq(registrations.status, 'REGISTERED')))
      .orderBy(asc(registrations.registeredAt))
      .limit(1);

    if (!next) {
      return { success: false, message: 'ไม่มีผู้รอในคิวของรอบนี้แล้ว' };
    }

    const result = await updateRegistrationStatus(next.id, 'CHECKED_IN', performedBy);
    if (!result.success) {
      return { success: false, message: 'message' in result && result.message ? result.message : 'ไม่สามารถเรียกคนถัดไปได้' };
    }
    return { success: true, registration: result.registration };
  }

  if (isMemoryBackendAllowed()) {
    const waiting = inMemoryRegistrations
      .filter((r: MemoryRegistration) => r.slot_id === slotId && r.status === 'REGISTERED')
      .sort(
        (a: MemoryRegistration, b: MemoryRegistration) =>
          new Date(a.registered_at || a.created_at).getTime() -
          new Date(b.registered_at || b.created_at).getTime()
      );
    if (waiting.length === 0) {
      return { success: false, message: 'ไม่มีผู้รอในคิวของรอบนี้แล้ว' };
    }
    const result = await updateRegistrationStatus(waiting[0].id, 'CHECKED_IN', performedBy);
    if (!result.success) {
      return { success: false, message: 'message' in result && result.message ? result.message : 'ไม่สามารถเรียกคนถัดไปได้' };
    }
    return { success: true, registration: result.registration };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

/** Convenience: get a slot's display label. */
export async function getSlotLabel(slotId: string): Promise<string | null> {
  if (db) {
    const [slot] = await db
      .select({ startAt: timeSlots.startAt, endAt: timeSlots.endAt })
      .from(timeSlots)
      .where(eq(timeSlots.id, slotId))
      .limit(1);
    if (!slot) return null;
    return `${slot.startAt.toISOString()}|${slot.endAt.toISOString()}`;
  }
  if (isMemoryBackendAllowed()) {
    const slot = defaultSlots.find((s: MemoryTimeSlot) => s.id === slotId);
    if (!slot) return null;
    return `${slot.start_at}|${slot.end_at}`;
  }
  return null;
}
