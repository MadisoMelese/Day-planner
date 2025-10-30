import { readFileSync, readdirSync } from "fs";
import path from "path";

const __dirname = path.resolve("src/typedefs");

const typeDefs = readdirSync(__dirname)
  .filter((file) => file.endsWith(".graphql"))
  .map((file) => readFileSync(path.join(__dirname, file), "utf8"));

export default typeDefs;



