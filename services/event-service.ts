import { db } from '@/db';
import { events, timeSlots, eventContentBlocks } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { defaultEvent, defaultSlots, defaultContentBlocks } from '@/lib/db/store';

// High-speed In-memory TTL Cache (shields DB from 200+ concurrent requests spike)
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): T {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

export async function getEventBySlug(slug: string) {
  const cacheKey = `event:slug:${slug}`;
  const cached = getCached<typeof defaultEvent>(cacheKey);
  if (cached) return cached;

  if (db) {
    try {
      const result = await db
        .select()
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);
      if (result.length > 0) {
        return setCache(cacheKey, result[0], 30_000); // 30s cache
      }
    } catch (err) {
      console.warn('DB query failed for getEventBySlug, fallback to default:', err);
    }
  }

  if (slug === 'mumt-2026') return setCache(cacheKey, defaultEvent, 30_000);
  return null;
}

export async function getEventContentBlocks(eventId: string) {
  const cacheKey = `content_blocks:${eventId}`;
  const cached = getCached<typeof defaultContentBlocks>(cacheKey);
  if (cached) return cached;

  if (db) {
    try {
      const result = await db
        .select()
        .from(eventContentBlocks)
        .where(and(eq(eventContentBlocks.eventId, eventId), eq(eventContentBlocks.isVisible, true)))
        .orderBy(asc(eventContentBlocks.displayOrder));
      if (result.length > 0) {
        return setCache(cacheKey, result, 30_000);
      }
    } catch (err) {
      console.warn('DB query failed for getEventContentBlocks, fallback to default:', err);
    }
  }

  const fallback = defaultContentBlocks.filter(b => b.is_visible).sort((a, b) => a.display_order - b.display_order);
  return setCache(cacheKey, fallback, 30_000);
}

export async function getTimeSlots(eventId: string) {
  const cacheKey = `slots:${eventId}`;
  const cached = getCached<typeof defaultSlots>(cacheKey);
  if (cached) return cached;

  if (db) {
    try {
      const result = await db
        .select()
        .from(timeSlots)
        .where(and(eq(timeSlots.eventId, eventId), eq(timeSlots.isActive, true)))
        .orderBy(asc(timeSlots.startAt));
      if (result.length > 0) {
        return setCache(cacheKey, result, 5_000); // 5s short cache for slot numbers
      }
    } catch (err) {
      console.warn('DB query failed for getTimeSlots, fallback to default:', err);
    }
  }

  const fallback = defaultSlots.filter(s => s.is_active).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  return setCache(cacheKey, fallback, 5_000);
}

export async function updateEventSettings(slug: string, updates: {
  name?: string;
  shortName?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  venueName?: string;
  venueDetail?: string;
  registrationOpenAt?: string;
  registrationCloseAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'COMPLETED' | 'ARCHIVED';
}) {
  cache.delete(`event:slug:${slug}`);
  if (db) {
    try {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.shortName !== undefined) updateData.shortName = updates.shortName;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.startAt !== undefined) updateData.startAt = new Date(updates.startAt);
      if (updates.endAt !== undefined) updateData.endAt = new Date(updates.endAt);
      if (updates.venueName !== undefined) updateData.venueName = updates.venueName;
      if (updates.venueDetail !== undefined) updateData.venueDetail = updates.venueDetail;
      if (updates.registrationOpenAt !== undefined) updateData.registrationOpenAt = new Date(updates.registrationOpenAt);
      if (updates.registrationCloseAt !== undefined) updateData.registrationCloseAt = new Date(updates.registrationCloseAt);
      if (updates.status !== undefined) updateData.status = updates.status;

      const [updated] = await db
        .update(events)
        .set(updateData)
        .where(eq(events.slug, slug))
        .returning();

      if (updated) return { success: true, event: updated };
    } catch (err) {
      console.warn('DB update failed in updateEventSettings:', err);
    }
  }

  // Fallback to memory
  const { updateMemoryEvent } = await import('@/lib/db/store');
  const updated = await updateMemoryEvent({
    name: updates.name,
    short_name: updates.shortName,
    description: updates.description,
    start_at: updates.startAt,
    end_at: updates.endAt,
    venue_name: updates.venueName,
    venue_detail: updates.venueDetail,
    registration_open_at: updates.registrationOpenAt,
    registration_close_at: updates.registrationCloseAt,
    status: updates.status,
  });
  return { success: true, event: updated };
}

export async function updateTimeSlotSettings(slotId: string, eventId: string, capacity: number, isActive?: boolean) {
  cache.delete(`slots:${eventId}`);
  if (db) {
    try {
      const updateData: Record<string, unknown> = { capacity };
      if (isActive !== undefined) updateData.isActive = isActive;
      const [updated] = await db
        .update(timeSlots)
        .set(updateData)
        .where(eq(timeSlots.id, slotId))
        .returning();
      if (updated) return { success: true, slot: updated };
    } catch (err) {
      console.warn('DB update failed in updateTimeSlotSettings:', err);
    }
  }

  const { updateMemorySlotCapacity } = await import('@/lib/db/store');
  const updated = await updateMemorySlotCapacity(slotId, capacity, isActive);
  return { success: true, slot: updated };
}
