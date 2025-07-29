import logger from "@/libs/logger";
import { Request, Response, NextFunction } from "express"

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      { method: req.method, url: req.originalUrl, status: res.statusCode, duration },
      'HTTP Request'
    );
  });

  next();
}
