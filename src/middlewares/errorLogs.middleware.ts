import { logger } from "../utils/logger";

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  logger.error(JSON.stringify(err)); // Log del error

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
};
