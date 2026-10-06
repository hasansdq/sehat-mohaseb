import "server-only";

// ============================================================
// In-memory rate limiter (lightweight, no external deps)
// ============================================================
// Tracks request counts per IP + identifier in a Map with TTL.
// For multi-instance deployments, replace with Redis-backed limiter.
// ============================================================

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

// Periodic cleanup of expired entries (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request is allowed under the rate limit.
 * Returns { allowed: boolean, remaining: number, resetAt: number }.
 */
export function rateLimit(opts: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();
  const now = Date.now();
  const existing = store.get(opts.key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + opts.windowMs;
    store.set(opts.key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.maxRequests - 1, resetAt };
  }

  existing.count++;
  if (existing.count > opts.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  return { allowed: true, remaining: opts.maxRequests - existing.count, resetAt: existing.resetAt };
}

/**
 * Convenience: build a rate-limit key from request + identifier.
 */
export function rlKey(ip: string, endpoint: string, id?: string): string {
  return `rl:${endpoint}:${ip}${id ? ":" + id : ""}`;
}

/**
 * Get client IP from Next.js request (respects X-Forwarded-For).
 */
export function reqIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
