// cache.ts
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 900, checkperiod: 60 }); // TTL por defecto: 15 min

export const setCache = (key: string, value: any, ttl: number) => {
  cache.set(key, value, ttl);
};

export const getCache = (key: string) => {
  return cache.get(key);
};

export const delCache = (key: string) => {
  cache.keys().forEach((cacheKey: string) => {
    if (cacheKey.startsWith(key)) {
      cache.del(cacheKey);
    }
  });
};
export const clearCache = () => {
  return cache.flushAll();
};
export const clearCacheMiddleware = (
  req: any = null,
  res: any = null,
  next: any = null
) => {
  cache.flushAll();
  return next ? next() : true;
};

export const hasCache = (key: string) => {
  return cache.has(key);
};

export default cache;
