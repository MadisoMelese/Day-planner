import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const createAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.status },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const createRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};
