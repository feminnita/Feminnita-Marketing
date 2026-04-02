/**
 * Simple in-memory rate limiter for external API calls.
 * Prevents hitting provider rate limits by enforcing per-key windows.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check and consume a rate limit token.
 * @param key      Unique key (e.g. "meta:userId:123" or "bling:userId:45")
 * @param maxCalls Maximum calls allowed in the window
 * @param windowMs Window duration in milliseconds (default: 60_000 = 1 min)
 * @returns `{ allowed: boolean; remaining: number; resetAt: number }`
 */
export function rateLimit(
  key: string,
  maxCalls: number,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  if (entry.count >= maxCalls) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxCalls - entry.count, resetAt: entry.resetAt };
}

/**
 * Assert rate limit — throws TRPCError if exceeded.
 * Use at the top of protectedProcedure handlers.
 *
 * @example
 * assertRateLimit(`meta:${ctx.user.id}`, 30); // 30 calls/min per user
 */
export function assertRateLimit(
  key: string,
  maxCalls: number,
  windowMs = 60_000,
  message?: string
): void {
  const { allowed, remaining, resetAt } = rateLimit(key, maxCalls, windowMs);
  if (!allowed) {
    const { TRPCError } = require("@trpc/server");
    const waitSec = Math.ceil((resetAt - Date.now()) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: message ?? `Limite de requisições atingido. Tente novamente em ${waitSec}s.`,
    });
  }
}

/** Periodically clean up expired entries to prevent memory leaks (run every 5 min). */
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now >= entry.resetAt) store.delete(key);
  });
}, 5 * 60_000);
