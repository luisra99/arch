// middlewares/smartCache.ts
import { NextFunction, Request, Response } from "express";
import { delCache, getCache, setCache } from "../libs/cache";

export function smartCache(ttl = 1800) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const cached = getCache(req.url);
        if (cached) {
            return res.json(cached);
        }

        // Captura respuesta real para cachearla
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            const payload = body.data ?? body;
            setCache(req.url, payload, ttl);
            return originalJson(payload);
        };

        next();
    };
}
export function resetCache(key: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        delCache(key)
        next();
    };
}
