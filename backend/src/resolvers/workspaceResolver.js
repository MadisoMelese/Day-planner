import { pool } from "../db/connect.js";
import { AppError } from "../utils/errors.js";

const workspaceResolver = {
  Query: {
    // Get all workspaces
    getAllWorkspaces: async () => {
      try {
        const result = await pool.query("SELECT * FROM workspaces ORDER BY id DESC");
        return result.rows;
      } catch (err) {
        console.error("❌ Error fetching all workspaces:", err);
        throw new Error("Failed to fetch workspaces");
      }
    },

    // Single workspace + tasks
    getWorkspace: async (_, { id }) => {
      try {
        const workspaceRes = await pool.query(
          "SELECT * FROM workspaces WHERE id = $1",
          [id]
        );
        if (workspaceRes.rowCount === 0) throw new Error("Workspace not found");
        const workspace = workspaceRes.rows[0];

        // Fetch related tasks
        const tasksRes = await pool.query(
          "SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC",
          [id]
        );
        workspace.tasks = tasksRes.rows;

        return workspace;
      } catch (err) {
        console.error("❌ Error fetching workspace:", err);
        throw new Error("Failed to fetch workspace");
      }
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
