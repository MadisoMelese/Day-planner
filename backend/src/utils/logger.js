import winston from "winston";
import { pool } from "../db/connect.js";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
new winston.transports.File({ filename: "logs/audit.log" }),

    new winston.transports.Console(),
  ],
});

export const logEvent = async (userId, level, action, details = {}) => {
  logger.log(level, action, { userId, ...details });

  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, level, action, details)
       VALUES ($1, $2, $3, $4)`,
      [userId, level, action, details]
    );
  } catch (err) {
    console.error("DB log insert failed:", err.message);
  }
};
