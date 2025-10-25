import express from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import { userTypeDefs } from "./src/typedefs/userTypeDefs.js";
import { userResolvers } from "./src/resolvers/userResolvers.js";
import { taskTypeDefs } from "./src/typedefs/taskTypeDefs.js";
import { taskResolvers } from "./src/resolvers/taskResolvers.js";
import "./src/db/connect.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs: [userTypeDefs, taskTypeDefs],
  resolvers: [userResolvers, taskResolvers],
});

await server.start();
server.applyMiddleware({ app, path: "/graphql" });

app.get("/", (req, res) => {
  res.send("✅ Task Organizer Backend is Running");
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
});
