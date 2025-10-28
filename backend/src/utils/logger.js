import winston from "winston";
import { pool } from "../db/connect.js";
import fs from "fs";
import path from "path";

const logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, "audit.log") }),
    new winston.transports.Console(),
  ],
});

export async function logEvent(userId, level, action, details = {}, ip = null) {
  const entry = { timestamp: new Date().toISOString(), level, userId, ip, action, details };
  logger.log({ level, message: action, ...entry });

  try {
    await pool.query(
      `INSERT INTO audit_logs (level, user_id, ip_address, action, details) VALUES ($1,$2,$3,$4,$5)`,
      [level, userId, ip, action, details]
    );
  } catch (err) {
    logger.error("Failed to insert audit log to DB", { error: err.message, action, details });
  }
}
