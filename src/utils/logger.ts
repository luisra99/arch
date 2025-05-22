import { createLogger, format, transports } from "winston";
import path from "path";
import { cwd } from "process";

export const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
    ),
    transports: [
        new transports.File({ filename: path.join(cwd(), "logs", "error.log"), level: "error" }), // Logs de errores
        new transports.File({ filename: path.join(cwd(), "logs", "combined.log") }) // Todos los logs
    ]
});

// En producción, también loggea en la consola
if (process.env.NODE_ENV !== "production") {
    logger.add(new transports.Console({
        format: format.combine(format.colorize(), format.simple(),)
    }));
}


