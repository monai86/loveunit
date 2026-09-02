// Distributed PostgreSQL & In-Memory Rate Limiter (Server-only)
// Shared across horizontally scalable Vercel / serverless instances via Neon PostgreSQL `rate_limits` table.
// Falls back to in-memory sliding window when DATA_BACKEND=memory or DB is unavailable.

import crypto from 'crypto';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Optional target/account identifier (e.g. email or registration code) to throttle along with IP */
  targetIdentifier?: string;
  /** Optional action/endpoint scope */
  scope?: string;
}

// Global in-memory bucket store for development/testing fallback
const globalRateLimitState = globalThis as unknown as {
  __lvu_rateLimitBuckets?: Map<string, number[]>;
};

if (!globalRateLimitState.__lvu_rateLimitBuckets) {
  globalRateLimitState.__lvu_rateLimitBuckets = new Map<string, number[]>();
}

const memoryBuckets = globalRateLimitState.__lvu_rateLimitBuckets;

/**
 * Extracts client IP from proxy headers (x-forwarded-for, x-real-ip, cf-connecting-ip).
 */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf;
  return 'unknown';
}

function hashIdentifier(identifier: string): string {
  return crypto.createHash('sha256').update(identifier.trim().toLowerCase()).digest('hex').slice(0, 32);
}

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const times = memoryBuckets.get(key) || [];
  const fresh = times.filter((t) => t > windowStart);

  if (fresh.length >= limit) {
    memoryBuckets.set(key, fresh);
    return false;
  }

  fresh.push(now);
  memoryBuckets.set(key, fresh);
  return true;
}

async function checkPostgresRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!db || process.env.DATA_BACKEND === 'memory') {
    return checkMemoryRateLimit(key, limit, windowMs);
  }

  try {
    const resetAt = new Date(Date.now() + windowMs);
    const result = await db.execute(sql`
      INSERT INTO rate_limits (key, count, reset_at, created_at, updated_at)
      VALUES (${key}, 1, ${resetAt}, NOW(), NOW())
      ON CONFLICT (key) DO UPDATE
      SET count = CASE
        WHEN rate_limits.reset_at <= NOW() THEN 1
        ELSE rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN rate_limits.reset_at <= NOW() THEN ${resetAt}
        ELSE rate_limits.reset_at
      END,
      updated_at = NOW()
      RETURNING count, reset_at;
    `);

    const row = result.rows[0] as { count?: number } | undefined;
    const currentCount = Number(row?.count || 1);
    return currentCount <= limit;
  } catch (err) {
    // If PostgreSQL transiently fails or table is locked, gracefully fall back to in-memory check
    console.warn('[rate-limit] PostgreSQL rate limit check fallback to memory:', err);
    return checkMemoryRateLimit(key, limit, windowMs);
  }
}

/**
 * Checks rate limits asynchronously using PostgreSQL shared storage when available,
 * falling back to in-memory sliding window in test/mock modes.
 */
export async function checkRateLimitAsync(request: Request, options: RateLimitOptions): Promise<boolean> {
  if (process.env.ENABLE_RATE_LIMIT_FOR_TEST !== 'true') {
    if (
      process.env.CI ||
      process.env.NODE_ENV === 'test' ||
      process.env.DISABLE_RATE_LIMIT === 'true'
    ) {
      return true;
    }
  }

  const endpointPath = options.scope || new URL(request.url).pathname;
  const ipKey = `rl:ip:${getClientIp(request)}:${endpointPath}`;

  // 1. IP-based rate limit
  const ipAllowed = await checkPostgresRateLimit(ipKey, options.limit, options.windowMs);
  if (!ipAllowed) return false;

  // 2. Target identifier rate limit (if specified, e.g. email or registrationCode)
  if (options.targetIdentifier) {
    const hashedTarget = hashIdentifier(options.targetIdentifier);
    const targetKey = `rl:target:${hashedTarget}:${endpointPath}`;
    const targetLimit = Math.max(3, Math.floor(options.limit / 2));
    const targetAllowed = await checkPostgresRateLimit(targetKey, targetLimit, options.windowMs);
    if (!targetAllowed) return false;
  }

  return true;
}

/**
 * Synchronous backward-compatible helper for existing synchronous route callers.
 */
export function checkRateLimit(request: Request, options: RateLimitOptions): boolean {
  if (process.env.ENABLE_RATE_LIMIT_FOR_TEST !== 'true') {
    if (
      process.env.CI ||
      process.env.NODE_ENV === 'test' ||
      process.env.DISABLE_RATE_LIMIT === 'true'
    ) {
      return true;
    }
  }

  const endpointPath = options.scope || new URL(request.url).pathname;
  const ipKey = `rl:ip:${getClientIp(request)}:${endpointPath}`;
  const ipAllowed = checkMemoryRateLimit(ipKey, options.limit, options.windowMs);
  if (!ipAllowed) return false;

  if (options.targetIdentifier) {
    const hashedTarget = hashIdentifier(options.targetIdentifier);
    const targetKey = `rl:target:${hashedTarget}:${endpointPath}`;
    const targetLimit = Math.max(3, Math.floor(options.limit / 2));
    const targetAllowed = checkMemoryRateLimit(targetKey, targetLimit, options.windowMs);
    if (!targetAllowed) return false;
  }

  return true;
}

/** Small helper that builds a standard 429 response. */
export function rateLimitedResponse(retryAfterSeconds: number): Response {
  return new Response(JSON.stringify({
    success: false,
    message: 'มีการส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfterSeconds),
    },
  });
}
