import { Request, Response } from "express";
import { clearCacheService, getAllLogsService, getErrorsLogsPathService } from "../services/debug.service";
import logger from "../../../libs/logger";

export const clearCacheController = (req: Request, res: Response) => {
    clearCacheService()
    res.status(200).json();
}

export const getErrorsLogsController = (req: Request, res: Response) => {
    try {
        const logFilePath = getErrorsLogsPathService()
        res.download(logFilePath, "app.log", (err) => {
            if (err) {
                logger.error("Error sending log file:", err);
                res.status(500).json({ message: "Error downloading log file" });
            }
        });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
    }
}

export const getAllLogsController = (req: Request, res: Response) => {
    try {
        const logFilePath = getAllLogsService()
        res.download(logFilePath, "app.log", (err) => {
            if (err) {
                logger.error("Error sending log file:", err);
                res.status(500).json({ message: "Error downloading log file" });
            }
        });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
    }
}