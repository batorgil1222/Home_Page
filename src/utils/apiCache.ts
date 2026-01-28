type CacheRecord<T> = {
  timestamp: number;
  data: T;
};

export function cacheGet<T>(key: string, ttlMs: number): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    const expired = Date.now() - parsed.timestamp > ttlMs;
    if (expired) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function cacheSet<T>(key: string, data: T) {
  const record: CacheRecord<T> = { timestamp: Date.now(), data };
  localStorage.setItem(key, JSON.stringify(record));
}

export function cacheRemove(key: string) {
  localStorage.removeItem(key);
}
