/**
 * Sliding-window rate limiter kept in memory. The site runs as one Node.js process on
 * Hostinger, so a process-local map is enough; it resets when the app restarts.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return {
    /** Records an attempt and returns false when the key is over its limit. */
    allow(key: string, now: number): boolean {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      hits.set(key, [...recent, now]);
      // Keep memory bounded: drop keys whose attempts have all expired.
      if (hits.size > 5000) {
        for (const [entry, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(entry);
      }
      return true;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
