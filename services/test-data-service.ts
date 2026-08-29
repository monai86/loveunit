import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs, checkinEvents, registrations, timeSlots, waitlist } from '@/db/schema';
import { defaultEvent, defaultSlots, inMemoryRegistrations } from '@/lib/db/store';
import { inMemoryWaitlist } from '@/services/waitlist-service';
import { isMemoryBackendAllowed } from '@/lib/db/store';
import { recordAuditLog } from '@/services/admin-service';

export async function resetTestData(actorId: string, eventId = defaultEvent.id) {
  if (db) {
    return db.transaction(async (tx) => {
      const regs = await tx.select({ id: registrations.id }).from(registrations).where(eq(registrations.eventId, eventId));
      const wls = await tx.select({ id: waitlist.id }).from(waitlist).where(eq(waitlist.eventId, eventId));
      await tx.delete(checkinEvents).where(eq(checkinEvents.eventId, eventId));
      await tx.delete(waitlist).where(eq(waitlist.eventId, eventId));
      await tx.delete(registrations).where(eq(registrations.eventId, eventId));
      await tx.update(timeSlots).set({ bookedCount: 0 }).where(eq(timeSlots.eventId, eventId));
      await tx.insert(auditLogs).values({ actorId: actorId.startsWith('u-') ? null : actorId, action: 'RESET_TEST_DATA', entityType: 'event', entityId: eventId, metadata: { deletedRegistrations: regs.length, deletedWaitlist: wls.length } });
      return { deletedRegistrations: regs.length, deletedWaitlist: wls.length };
    });
  }
  if (!isMemoryBackendAllowed()) throw new Error('DATABASE_URL is unconfigured in production environment.');
  const deletedRegistrations = inMemoryRegistrations.filter((registration) => registration.event_id === eventId).length;
  for (let index = inMemoryRegistrations.length - 1; index >= 0; index -= 1) {
    if (inMemoryRegistrations[index].event_id === eventId) inMemoryRegistrations.splice(index, 1);
  }
  const deletedWaitlist = inMemoryWaitlist.filter((entry) => entry.event_id === eventId).length;
  for (let index = inMemoryWaitlist.length - 1; index >= 0; index -= 1) {
    if (inMemoryWaitlist[index].event_id === eventId) inMemoryWaitlist.splice(index, 1);
  }
  for (const slot of defaultSlots.filter((candidate) => candidate.event_id === eventId)) slot.booked_count = 0;
  await recordAuditLog({ actorId, action: 'RESET_TEST_DATA', entityType: 'event', entityId: eventId, metadata: { deletedRegistrations, deletedWaitlist } });
  return { deletedRegistrations, deletedWaitlist };
}
