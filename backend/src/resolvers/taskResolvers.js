import { pool } from "../db/connect.js";
import { logEvent } from "../utils/logger.js";

export const taskResolvers = {
  Query: {
    getTasks: async (_, { user_id }) => {
      const result = await pool.query(
        `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id]
      );
      return result.rows;
    },
    getTaskById: async (_, { id }) => {
      const result = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
      return result.rows[0];
    },
  },

  Mutation: {
    createTask: async (_, { user_id, title, description }) => {
      const result = await pool.query(
        `INSERT INTO tasks (user_id, title, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [user_id, title, description]
      );
      const newTask = result.rows[0];
      await logEvent(user_id, "info", "TASK_CREATED", { title });
      return newTask;
    },

    updateTask: async (_, { id, title, description, status }) => {
      const result = await pool.query(
        `UPDATE tasks 
         SET title = COALESCE($2, title),
             description = COALESCE($3, description),
             status = COALESCE($4, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, title, description, status]
      );
      const updatedTask = result.rows[0];
      await logEvent(updatedTask.user_id, "info", "TASK_UPDATED", { id });
      return updatedTask;
    },

    deleteTask: async (_, { id }) => {
      await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
      await logEvent(null, "warn", "TASK_DELETED", { id });
      return true;
    },
  },
};
