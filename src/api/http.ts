import axios from "axios";
import { cacheGet, cacheSet } from "../utils/apiCache";

export const http = axios.create({
  timeout: 15000,
});

type CachedGetOptions = {
  ttlMs?: number;      
  force?: boolean;     
  cacheKey?: string;   
};

export async function cachedGet<T>(
  url: string,
  opts: CachedGetOptions = {}
): Promise<T> {
  const ttlMs = opts.ttlMs ?? 10 * 60 * 1000; 
  const key = opts.cacheKey ?? `CACHE::GET::${url}`;

  if (!opts.force) {
    const cached = cacheGet<T>(key, ttlMs);
    if (cached) return cached;
  }

  const res = await http.get<T>(url);
  cacheSet<T>(key, res.data);
  return res.data;
}
