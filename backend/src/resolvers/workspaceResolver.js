import { pool } from "../db/connect.js";

export const workspaceResolver = {
  Query: {
    getAllWorkspaces: async () => {
      const result = await pool.query("SELECT * FROM workspaces ORDER BY id DESC");
      return result.rows;
    },
    getWorkspace: async (_, { id }) => {
      const result = await pool.query("SELECT * FROM workspaces WHERE id = $1", [id]);
      return result.rows[0];
    },
  },

  Mutation: {
    createWorkspace: async (_, { name, description }) => {
      const result = await pool.query(
        "INSERT INTO workspaces (name, description) VALUES ($1, $2) RETURNING *",
        [name, description]
      );
      return result.rows[0];
    },

    updateWorkspace: async (_, { id, name, description }) => {
      const result = await pool.query(
        `UPDATE workspaces 
         SET name = COALESCE($2, name), description = COALESCE($3, description)
         WHERE id = $1 RETURNING *`,
        [id, name, description]
      );
      return result.rows[0];
    },

    deleteWorkspace: async (_, { id }) => {
      const result = await pool.query("DELETE FROM workspaces WHERE id = $1", [id]);
      return result.rowCount > 0;
    },
  },
};
