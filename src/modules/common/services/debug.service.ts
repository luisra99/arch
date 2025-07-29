import { clearCache } from "@/libs/cache";
import path from "path";
import { cwd } from "process";
import fs from "fs";

export const clearCacheService = () => {
    clearCache();
}
export const getErrorsLogsPathService = () => {
    const logFilePath = path.join(cwd(), "logs", "errors.log");
    if (!fs.existsSync(logFilePath)) {
        throw { message: "Log file not found" };
    }
    return logFilePath
}

export const getAllLogsService = () => {
    const logFilePath = path.join(cwd(), "logs", "combined.log");
    if (!fs.existsSync(logFilePath)) {
        throw { message: "Log file not found" };
    }
    return logFilePath
}