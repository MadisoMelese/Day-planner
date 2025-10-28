import { pool } from "../db/connect.js";
import { logEvent } from "../utils/logger.js";

export const taskResolvers = {
  Query: {
    getTasks: async (_, { user_id }) => {
      const { rows } = await pool.query("SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC", [user_id]);
      return rows;
    },
    getTaskById: async (_, { id }) => {
      const { rows } = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
      return rows[0];
    },
  },
  Mutation: {
    createTask: async (_, { user_id, title, description }) => {
      const { rows } = await pool.query(
        "INSERT INTO tasks (user_id,title,description) VALUES ($1,$2,$3) RETURNING *",
        [user_id, title, description]
      );
      await logEvent(user_id, "info", "TASK_CREATED", { title });
      return rows[0];
    },
    updateTask: async (_, { id, title, description, status }) => {
      const { rows } = await pool.query(
        `UPDATE tasks SET
           title = COALESCE($2,title),
           description = COALESCE($3,description),
           status = COALESCE($4,status),
           updated_at = CURRENT_TIMESTAMP
         WHERE id=$1 RETURNING *`,
        [id, title, description, status]
      );
      await logEvent(rows[0].user_id, "info", "TASK_UPDATED", { id });
      return rows[0];
    },
    deleteTask: async (_, { id }) => {
      await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
      await logEvent(null, "warn", "TASK_DELETED", { id });
      return true;
    },
  },
};
