import logger from "@libs/logger";
import { Request, Response } from "express"
import { env } from "@config/env"


export function errorLogger(err: Error, req: Request, res: Response,) {
  const error = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    cookies: req.cookies,
  }
  logger.error(
    error,
    'Unhandled Error'
  );
  res.status(500).json({ errorMessage: 'Algo salió mal', ...(env.NODE_ENV !== "production" && error) });
}
