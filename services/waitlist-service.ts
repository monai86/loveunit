// Waitlist service — donors can join a waitlist for full time slots and get
// promoted into a real registration when space frees up (e.g. after a cancel).

import { db } from '@/db';
import { waitlist, timeSlots } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { normalizePhoneNumber } from '@/lib/utils/format';
import { isMemoryBackendAllowed, defaultSlots } from '@/lib/db/store';
import { registerDonorAtomic } from '@/services/registration-service';

export async function joinWaitlist(input: {
  eventId: string;
  slotId: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const phoneNormalized = normalizePhoneNumber(input.phone);

  if (db) {
    // Don't allow joining the waitlist if the slot still has space.
    const [slot] = await db
      .select()
      .from(timeSlots)
      .where(and(eq(timeSlots.id, input.slotId), eq(timeSlots.eventId, input.eventId), eq(timeSlots.isActive, true)))
      .limit(1);
    if (!slot) return { success: false, message: 'ไม่พบช่วงเวลาที่เลือก' };
    if (slot.bookedCount < slot.capacity) {
      return { success: false, message: 'ช่วงเวลานี้ยังมีที่ว่าง กรุณาลงทะเบียนแทน' };
    }

    // Dedupe by (slot, phone, status WAITING).
    const existing = await db
      .select({ id: waitlist.id })
      .from(waitlist)
      .where(and(eq(waitlist.slotId, input.slotId), eq(waitlist.phoneNormalized, phoneNormalized), eq(waitlist.status, 'WAITING')))
      .limit(1);
    if (existing.length > 0) {
      return { success: false, message: 'เบอร์โทรนี้อยู่ในรายการรอของช่วงเวลานี้แล้ว' };
    }

    const [entry] = await db
      .insert(waitlist)
      .values({
        eventId: input.eventId,
        slotId: input.slotId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        phoneNormalized,
        status: 'WAITING',
      })
      .returning();
    return { success: true, entry };
  }

  if (isMemoryBackendAllowed()) {
    const slot = defaultSlots.find((s) => s.id === input.slotId);
    if (!slot) return { success: false, message: 'ไม่พบช่วงเวลาที่เลือก' };
    if (slot.booked_count < slot.capacity) {
      return { success: false, message: 'ช่วงเวลานี้ยังมีที่ว่าง กรุณาลงทะเบียนแทน' };
    }
    const existing = inMemoryWaitlist.find(
      (w) => w.slot_id === input.slotId && w.phone_normalized === phoneNormalized && w.status === 'WAITING'
    );
    if (existing) return { success: false, message: 'เบอร์โทรนี้อยู่ในรายการรอของช่วงเวลานี้แล้ว' };

    const entry = {
      id: `wl-${Date.now()}`,
      event_id: input.eventId,
      slot_id: input.slotId,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      phone: input.phone.trim(),
      phone_normalized: phoneNormalized,
      status: 'WAITING' as const,
      created_at: new Date().toISOString(),
      notified_at: null as string | null,
      promoted_registration_id: null as string | null,
    };
    inMemoryWaitlist.push(entry);
    return { success: true, entry };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getWaitlist(eventId: string) {
  if (db) {
    return await db.query.waitlist.findMany({
      where: eq(waitlist.eventId, eventId),
      orderBy: [desc(waitlist.createdAt)],
      with: {
        timeSlot: true,
      },
    });
  }

  if (isMemoryBackendAllowed()) {
    return inMemoryWaitlist
      .filter((w) => w.event_id === eventId)
      .map((w) => ({ ...w, time_slot: defaultSlots.find((s) => s.id === w.slot_id) || null }));
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function removeFromWaitlist(id: string) {
  if (db) {
    const [removed] = await db
      .update(waitlist)
      .set({ status: 'REMOVED' })
      .where(and(eq(waitlist.id, id), eq(waitlist.status, 'WAITING')))
      .returning();
    return { success: Boolean(removed) };
  }

  if (isMemoryBackendAllowed()) {
    const entry = inMemoryWaitlist.find((w) => w.id === id && w.status === 'WAITING');
    if (entry) entry.status = 'REMOVED';
    return { success: Boolean(entry) };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

/**
 * Creates a real registration for the next waiting donor of a slot (FIFO) and
 * marks the waitlist entry NOTIFIED. Returns the promoted entry or null.
 */
export async function promoteFromWaitlist(slotId: string, eventId: string) {
  if (db) {
    // FIFO: oldest WAITING entry for this slot.
    const [entry] = await db
      .select()
      .from(waitlist)
      .where(and(eq(waitlist.slotId, slotId), eq(waitlist.eventId, eventId), eq(waitlist.status, 'WAITING')))
      .orderBy(asc(waitlist.createdAt))
      .limit(1);
    if (!entry) return { success: false, message: 'ไม่มีผู้รอในรายการ' };

    const regResult = await registerDonorAtomic({
      eventId: entry.eventId,
      firstName: entry.firstName,
      lastName: entry.lastName,
      phone: entry.phone,
      participantType: 'GENERAL_PUBLIC',
      donationExperience: 'FIRST_TIME',
      slotId: entry.slotId,
      source: 'ADMIN',
    });

    if (!regResult.success) {
      // Slot may have filled again — keep the donor waiting.
      return { success: false, message: regResult.message || 'ไม่สามารถเลื่อนผู้รอได้' };
    }

    const registration = regResult.registration as { id: string };
    await db
      .update(waitlist)
      .set({
        status: 'NOTIFIED',
        notifiedAt: new Date(),
        promotedRegistrationId: registration.id,
      })
      .where(eq(waitlist.id, entry.id));

    return { success: true, registration, entry };
  }

  if (isMemoryBackendAllowed()) {
    const entry = inMemoryWaitlist
      .filter((w) => w.slot_id === slotId && w.event_id === eventId && w.status === 'WAITING')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
    if (!entry) return { success: false, message: 'ไม่มีผู้รอในรายการ' };

    const regResult = await registerDonorAtomic({
      eventId,
      firstName: entry.first_name,
      lastName: entry.last_name,
      phone: entry.phone,
      participantType: 'GENERAL_PUBLIC',
      donationExperience: 'FIRST_TIME',
      slotId,
      source: 'ADMIN',
    });
    if (!regResult.success || !regResult.registration) {
      return { success: false, message: regResult.message || 'ไม่สามารถเลื่อนผู้รอได้' };
    }
    entry.status = 'NOTIFIED';
    entry.notified_at = new Date().toISOString();
    entry.promoted_registration_id = regResult.registration.id;
    return { success: true, registration: regResult.registration, entry };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

// ---- In-memory backing for local dev / tests ----
interface MemoryWaitlistEntry {
  id: string;
  event_id: string;
  slot_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_normalized: string;
  status: 'WAITING' | 'NOTIFIED' | 'REMOVED';
  created_at: string;
  notified_at: string | null;
  promoted_registration_id: string | null;
}

const inMemoryWaitlist: MemoryWaitlistEntry[] = [];

export { inMemoryWaitlist };
