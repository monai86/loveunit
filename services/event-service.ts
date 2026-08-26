import { db } from '@/db';
import { events, timeSlots, eventContentBlocks } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { defaultEvent, defaultSlots, defaultContentBlocks } from '@/lib/db/store';

export async function getEventBySlug(slug: string) {
  if (db) {
    try {
      const result = await db
        .select()
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);
      if (result.length > 0) return result[0];
    } catch (err) {
      console.warn('DB query failed for getEventBySlug, fallback to default:', err);
    }
  }

  if (slug === 'mumt-2026') return defaultEvent;
  return null;
}

export async function getEventContentBlocks(eventId: string) {
  if (db) {
    try {
      const result = await db
        .select()
        .from(eventContentBlocks)
        .where(and(eq(eventContentBlocks.eventId, eventId), eq(eventContentBlocks.isVisible, true)))
        .orderBy(asc(eventContentBlocks.displayOrder));
      if (result.length > 0) return result;
    } catch (err) {
      console.warn('DB query failed for getEventContentBlocks, fallback to default:', err);
    }
  }

  return defaultContentBlocks.filter(b => b.is_visible).sort((a, b) => a.display_order - b.display_order);
}

export async function getTimeSlots(eventId: string) {
  if (db) {
    try {
      const result = await db
        .select()
        .from(timeSlots)
        .where(and(eq(timeSlots.eventId, eventId), eq(timeSlots.isActive, true)))
        .orderBy(asc(timeSlots.startAt));
      if (result.length > 0) return result;
    } catch (err) {
      console.warn('DB query failed for getTimeSlots, fallback to default:', err);
    }
  }

  return defaultSlots.filter(s => s.is_active).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}
