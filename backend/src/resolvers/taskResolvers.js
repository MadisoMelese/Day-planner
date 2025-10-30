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
    getTasks: async (_, { user_id }) => {
      const result = await pool.query(
        "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
        [user_id]
      );
      return result.rows;
    },
    getTaskById: async (_, { id }) => {
      const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
      return result.rows[0];
    },
  },

 Mutation: {
    // ✅ CREATE TASK
    createTask: async (_, { user_id, title, description }) => {
      if (!title || title.trim() === "") {
        throw new AppError("Task title required", 400);
      }

      const result = await pool.query(
        `INSERT INTO tasks (user_id, title, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [user_id, title, description]
      );

      const newTask = result.rows[0];

      await logEvent(user_id, "info", "TASK_CREATED", { title });

      // 🔥 Publish (instead of emit)
      pubsub.publish("TASK_CREATED", newTask);

      return newTask;
    },

    // ✅ UPDATE TASK
    updateTask: async (_, { id, title, description, status }) => {
      const check = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
      if (check.rows.length === 0) {
        throw new AppError("Task not found", 404);
      }

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

      // 🔥 Also publish task updates in real time
      pubsub.publish("TASK_UPDATED", updatedTask);

      return updatedTask;
    },

    // ✅ DELETE TASK
    deleteTask: async (_, { id }) => {
      const check = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        throw new AppError("Task not found", 404);
      }

      await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
      await logEvent(null, "warn", "TASK_DELETED", { id });

      pubsub.publish("TASK_DELETED", { id });

      return true;
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
