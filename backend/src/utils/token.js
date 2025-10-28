import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function createAccessToken(user) {
  return jwt.sign({ userId: user.id, role: user.status }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

export function createRefreshToken(user) {
  return jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}
export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}
