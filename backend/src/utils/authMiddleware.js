// src/utils/authMiddleware.js
import { verifyAccessToken } from "./token.js";

export function getUserFromAuthHeader(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.split(" ")[1];
  try {
    return verifyAccessToken(token); // returns payload
  } catch (err) {
    return null;
  }
}

export function requireAuthGraphQL(context) {
  // context will include req
  const payload = getUserFromAuthHeader(context.req);
  if (!payload) throw new Error("Unauthorized");
  return payload;
}
