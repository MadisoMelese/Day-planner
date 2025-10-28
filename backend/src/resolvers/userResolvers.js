import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db/connect.js";
import { logEvent } from "../utils/logger.js";
import { createAccessToken, createRefreshToken } from "../utils/token.js";

dotenv.config();

export const userResolvers = {

  Mutation: {
    register: async (_, { email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (email, password)
         VALUES ($1, $2)
         RETURNING id, email, status, created_at`,
        [email, hashedPassword]
      );
      const newUser = result.rows[0];
      await logEvent(newUser.id, "info", "USER_REGISTERED", { email });
      return newUser;
    },

    login: async (_, { email, password }) => {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      const user = result.rows[0];
      if (!user) throw new Error("User not found");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid password");

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      await logEvent(user.id, "info", "USER_LOGGED_IN", { email });

      return {
        accessToken,
        refreshToken,
        user,
      };
    },

    refreshToken: async (_, { token }) => {
      try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [payload.userId]);
        const user = result.rows[0];
        if (!user) throw new Error("User not found");

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        return {
          accessToken,
          refreshToken,
          user,
        };
      } catch (err) {
        throw new Error("Invalid or expired refresh token");
      }
    },
  },
};
