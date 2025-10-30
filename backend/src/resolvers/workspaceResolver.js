import { pool } from "../db/connect.js";
import { AppError } from "../utils/errors.js";

const workspaceResolver = {
  Query: {
    async getWorkspace(_, { id }) {
      const result = await pool.query("SELECT * FROM workspaces WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        throw new AppError("Workspace not found", 404);
      }

      return result.rows[0];
    },

    async getAllWorkspaces() {
      const result = await pool.query("SELECT * FROM workspaces ORDER BY id DESC");
      return result.rows;
    },
  },

  Mutation: {
    async createWorkspace(_, { name, description }) {
      if (!name || name.trim() === "") {
        throw new AppError("Workspace name required", 400);
      }
      

      const result = await pool.query(
        "INSERT INTO workspaces (name, description) VALUES ($1, $2) RETURNING *",
        [name, description]
      );

      return result.rows[0];
    },

    async updateWorkspace(_, { id, name, description }) {
      const existing = await pool.query("SELECT * FROM workspaces WHERE id = $1", [id]);
      if (existing.rows.length === 0) {
        throw new AppError("Workspace not found", 404);
      }

      const updated = await pool.query(
        "UPDATE workspaces SET name = $1, description = $2 WHERE id = $3 RETURNING *",
        [name || existing.rows[0].name, description || existing.rows[0].description, id]
      );

      return updated.rows[0];
    },

    async deleteWorkspace(_, { id }) {
      const existing = await pool.query("SELECT * FROM workspaces WHERE id = $1", [id]);
      if (existing.rows.length === 0) {
        throw new AppError("Workspace not found", 404);
      }

      await pool.query("DELETE FROM workspaces WHERE id = $1", [id]);
      return true;
    },
  },
};

export default workspaceResolver;
