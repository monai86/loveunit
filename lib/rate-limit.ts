// In-memory sliding-window rate limiter (server-only).
// Suitable for single-instance deploys (default Next/Docker target). For
// multi-instance setups swap this for a shared store (Redis/Postgres).
//
// Usage:
//   const allowed = checkRateLimit(request, { limit: 10, windowMs: 60_000 });
//   if (!allowed) return NextResponse.json({...}, { status: 429 });

interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

// bucketKey -> sorted timestamps (ms) of recent requests
const buckets = new Map<string, number[]>();

// Periodic cleanup so the map never grows unboundedly.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 min
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, times] of buckets) {
      // Keep buckets that still have fresh timestamps.
      const fresh = times.filter((t) => now - t < 24 * 60 * 60 * 1000);
      if (fresh.length === 0) {
        buckets.delete(key);
      } else {
        buckets.set(key, fresh);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // Don't keep the process alive just for this.
  if (cleanupTimer.unref) cleanupTimer.unref();
}

/**
 * Extracts the best-effort client IP from common proxy headers, falling back
 * to the raw socket address. Never trust these blindly in production behind a
 * trusted proxy — they are a rate-limit key, not an identity.
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

/**
 * Returns `true` when the request is within the limit. Records the request
 * when it is allowed (a blocked request is not recorded, so the client must
 * wait for the window to roll over).
 */
export function checkRateLimit(request: Request, options: RateLimitOptions): boolean {
  if (process.env.CI) return true;
  ensureCleanup();
  const now = Date.now();
  const key = `ip:${getClientIp(request)}:${request.method}:${new URL(request.url).pathname}`;
  const windowStart = now - options.windowMs;

  const times = buckets.get(key) || [];
  const fresh = times.filter((t) => t > windowStart);

  if (fresh.length >= options.limit) {
    buckets.set(key, fresh);
    return false;
  }

  fresh.push(now);
  buckets.set(key, fresh);
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
