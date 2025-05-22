import { Router } from "express";
import path from "path";
import { cwd } from "process";
import { logger } from "../../utils/logger";
import fs from "fs";
import { clearCache } from "../../libs/cache";
const os = require("os");

const router = Router();
router.get("/clear", (req, res) => {
  clearCache();

  res.status(200).json();
});
router.get("/get-logs/error", (req, res) => {
  const logFilePath = path.join(cwd(), "logs", "error.log");

  if (!fs.existsSync(logFilePath)) {
    return res.status(404).json({ message: "Log file not found" });
  }

  res.download(logFilePath, "app.log", (err) => {
    if (err) {
      logger.error("Error sending log file:", err);
      res.status(500).json({ message: "Error downloading log file" });
    }
  });
});
router.get("/get-logs/all", (req, res) => {
  const logFilePath = path.join(cwd(), "logs", "combined.log");

  if (!fs.existsSync(logFilePath)) {
    return res.status(404).json({ message: "Log file not found" });
  }

  res.download(logFilePath, "app.log", (err) => {
    if (err) {
      logger.error("Error sending log file:", err);
      res.status(500).json({ message: "Error downloading log file" });
    }
  });
});

export default router;
