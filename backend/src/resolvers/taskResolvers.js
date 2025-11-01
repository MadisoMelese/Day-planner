// import { pool } from "../db/connect.js";
// import { logEvent } from "../utils/logger.js";

// export const taskResolvers = {
//   Query: {
//     getTasks: async (_, { user_id }) => {
//       const { rows } = await pool.query("SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC", [user_id]);
//       return rows;
//     },
//     getTaskById: async (_, { id }) => {
//       const { rows } = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
//       return rows[0];
//     },
//   },
//   Mutation: {
//     createTask: async (_, { user_id, title, description }) => {
//       const { rows } = await pool.query(
//         "INSERT INTO tasks (user_id,title,description) VALUES ($1,$2,$3) RETURNING *",
//         [user_id, title, description]
//       );
//       await logEvent(user_id, "info", "TASK_CREATED", { title });
//       return rows[0];
//     },
//     updateTask: async (_, { id, title, description, status }) => {
//       const { rows } = await pool.query(
//         `UPDATE tasks SET
//            title = COALESCE($2,title),
//            description = COALESCE($3,description),
//            status = COALESCE($4,status),
//            updated_at = CURRENT_TIMESTAMP
//          WHERE id=$1 RETURNING *`,
//         [id, title, description, status]
//       );
//       await logEvent(rows[0].user_id, "info", "TASK_UPDATED", { id });
//       return rows[0];
//     },
//     deleteTask: async (_, { id }) => {
//       await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
//       await logEvent(null, "warn", "TASK_DELETED", { id });
//       return true;
//     },
//   },
// };

import { pool } from "../db/connect.js";
import { AppError } from "../utils/errors.js";
import { logEvent } from "../utils/logger.js";
import { pubsub } from "../utils/pubsub.js";

export const taskResolvers = {
  Query: {
    // ✅ Get all tasks in a specific workspace
    getTasks: async (_, { workspaceId }) => {
      try {
        const result = await pool.query(
          "SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC",
          [workspaceId]
        );
        return result.rows;
      } catch (err) {
        console.error("❌ Error fetching tasks:", err);
        throw new Error("Failed to fetch tasks");
      }
    },

    // ✅ Get a single task
    getTaskById: async (_, { id }) => {
      try {
        const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [
          id,
        ]);
        return result.rows[0];
      } catch (err) {
        console.error("❌ Error fetching task:", err);
        throw new Error("Failed to fetch task");
      }
    },
  },

  Mutation: {
    // ✅ Create a task inside a workspace
    createTask: async (_, { workspaceId, title, description }) => {
      try {
        if (!title || !workspaceId)
          throw new Error("Workspace ID and title are required");

        // Check workspace exists
        const workspaceExists = await pool.query(
          "SELECT id FROM workspaces WHERE id = $1",
          [workspaceId]
        );
        if (workspaceExists.rowCount === 0)
          throw new Error("Workspace not found");

        const result = await pool.query(
          `INSERT INTO tasks (workspace_id, title, description, status, created_at)
VALUES ($1, $2, $3, 'pending', NOW())


           RETURNING *`,
          [workspaceId, title, description || null]
        );

        const newTask = result.rows[0];
        await logEvent(null, "info", "TASK_CREATED", { title, workspaceId });
        return newTask;
      } catch (err) {
        console.error("❌ Error creating task:", err);
        throw new AppError(err.message || "Failed to create task");
      }
    },

    // ✅ Update a task
    updateTask: async (_, { id, title, description, status }) => {
      try {
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

        if (result.rowCount === 0) throw new AppError("Task not found");

        const updatedTask = result.rows[0];
        await logEvent(null, "info", "TASK_UPDATED", { id });
        return updatedTask;
      } catch (err) {
        console.error("❌ Error updating task:", err);
        throw new AppError("Failed to update task");
      }
    },

    // ✅ Delete a task
    deleteTask: async (_, { id }) => {
      try {
        const result = await pool.query(
          "DELETE FROM tasks WHERE id = $1 RETURNING id",
          [id]
        );
        if (result.rowCount === 0) throw new AppError("Task not found");

        await logEvent(null, "warn", "TASK_DELETED", { id });
        return true;
      } catch (err) {
        console.error("❌ Error deleting task:", err);
        throw new AppError("Failed to delete task");
      }
    },
  },

  // ✅ SUBSCRIPTIONS (live updates)
  Subscription: {
    // When new task is created
    taskCreated: {
      subscribe: (_, { user_id }) => pubsub.asyncIterator("TASK_CREATED"),
      resolve: (payload) => payload,
    },

    // When task is updated
    taskUpdated: {
      subscribe: () => pubsub.asyncIterator("TASK_UPDATED"),
      resolve: (payload) => payload,
    },

    // When task is deleted
    taskDeleted: {
      subscribe: () => pubsub.asyncIterator("TASK_DELETED"),
      resolve: (payload) => payload,
    },
  },
};
