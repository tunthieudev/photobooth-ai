// Lightweight In-Memory Cache (No Redis external server required)
const inMemoryCache = new Map<string, { value: any; expiresAt: number }>();

export async function getCache<T>(key: string): Promise<T | null> {
  const item = inMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    inMemoryCache.delete(key);
    return null;
  }
  return item.value as T;
}

export async function setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export default getCache;
