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
