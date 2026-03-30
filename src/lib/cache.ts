// Simple in-memory cache with TTL and tag-based invalidation
// Works in serverless (per-instance), good enough for a small app

interface CacheEntry<T> {
  data: T;
  expiry: number;
  tags: string[];
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number, tags: string[] = []) {
  store.set(key, { data, expiry: Date.now() + ttlMs, tags });
}

export function cacheInvalidate(...tags: string[]) {
  const tagSet = new Set(tags);
  for (const [key, entry] of store.entries()) {
    if (entry.tags.some((t) => tagSet.has(t))) {
      store.delete(key);
    }
  }
}

// Convenience: 10 minutes
export const TMDB_TTL = 10 * 60 * 1000;
// Long-lived: until invalidated (1 hour max)
export const DB_TTL = 60 * 60 * 1000;
