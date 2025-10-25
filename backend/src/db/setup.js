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
