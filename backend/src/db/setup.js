import { pool } from "./connect.js";
import fs from "fs";

const sql = fs.readFileSync("src/db/init.sql").toString() 
  + fs.readFileSync("src/db/task.sql").toString();


(async () => {
  try {
    await pool.query(sql);
    console.log("✅ Tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
    process.exit(1);
  }
})();
await pool.query(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);


