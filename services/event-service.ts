import { db } from '@/db';
import { events, timeSlots, eventContentBlocks } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { isMemoryBackendAllowed, defaultEvent, defaultSlots, defaultContentBlocks } from '@/lib/db/store';

export async function getEventBySlug(slug: string) {
  if (db) {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);
    if (result.length > 0) return result[0];
    return null;
  }

  if (isMemoryBackendAllowed()) {
    if (slug === 'mumt-2026') return defaultEvent;
    return null;
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getEventContentBlocks(eventId: string) {
  if (db) {
    return await db
      .select()
      .from(eventContentBlocks)
      .where(and(eq(eventContentBlocks.eventId, eventId), eq(eventContentBlocks.isVisible, true)))
      .orderBy(asc(eventContentBlocks.displayOrder));
  }

  if (isMemoryBackendAllowed()) {
    return defaultContentBlocks.filter(b => b.is_visible).sort((a, b) => a.display_order - b.display_order);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getTimeSlots(eventId: string) {
  if (db) {
    return await db
      .select()
      .from(timeSlots)
      .where(and(eq(timeSlots.eventId, eventId), eq(timeSlots.isActive, true)))
      .orderBy(asc(timeSlots.startAt));
  }

  if (isMemoryBackendAllowed()) {
    return defaultSlots.filter(s => s.is_active).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}
