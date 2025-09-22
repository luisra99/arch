import logger from "../libs/logger";
import { Request, Response } from "express"
import { env } from "../config/env"


export function errorLogger(err: Error, req: Request, res: Response,) {
  logger.error(
    err,
    'Unhandled Error'
  );
  res.status(500).json({ errorMessage: 'Algo salió mal' });
}
