import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db/connect.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { logEvent } from "../utils/logger.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id,email,status",
      [email, hash]
    );
    await logEvent(result.rows[0].id, "info", "USER_REGISTERED", { email });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await logEvent(user.id, "info", "USER_LOGGED_IN", { email });
  res.json({ accessToken, refreshToken });
});

router.post("/refresh", (req, res) => {
  const { token } = req.body;
  try {
    const payload = verifyRefreshToken(token);
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);
    res.json({ accessToken, refreshToken });
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
});

export default router;
