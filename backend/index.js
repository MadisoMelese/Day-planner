// import express from "express";
// import { ApolloServer } from "apollo-server-express";
// import dotenv from "dotenv";
// import { userTypeDefs } from "./src/typedefs/userTypeDefs.js";
// import { userResolvers } from "./src/resolvers/userResolvers.js";
// import { taskTypeDefs } from "./src/typedefs/taskTypeDefs.js";
// import { taskResolvers } from "./src/resolvers/taskResolvers.js";
// import "./src/db/connect.js";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 4000;

// const server = new ApolloServer({
//   typeDefs: [userTypeDefs, taskTypeDefs],
//   resolvers: [userResolvers, taskResolvers],
// });

// await server.start();
// server.applyMiddleware({ app, path: "/graphql" });

// app.get("/", (req, res) => {
//   res.send("✅ Task Organizer Backend is Running");
// });

// app.listen(port, () => {
//   console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
// });



// src/index.js

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import dotenv from "dotenv";
import { pool } from "./src/db/connect.js";
import typeDefs from "./src/typedefs/index.js";
import resolvers from "./src/resolvers/index.js";
import authRoutes from "./src/rest/authRoutes.js";
import { logEvent } from "./src/utils/logger.js";
import cors from "cors";
dotenv.config();

async function start() {
  const app = express();
  // app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
  // REST auth routes
  app.use("/auth", express.json(), authRoutes);

  // GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // HTTP server
  const httpServer = http.createServer(app);

  // WebSocket server for GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // GraphQL WS server
  const serverCleanup = useServer({ schema }, wsServer);

  // Apollo Server
 const server = new ApolloServer({
  schema,
  formatError: (err) => {
    // If it's our custom AppError, return clean message
    if (err.originalError?.statusCode) {
      return {
        success: false,
        message: err.message,
        code: err.originalError.statusCode,
      };
    }

    // Otherwise, return a default fallback
    return {
      success: false,
      message: "Internal Server Error",
    };
  },
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup?.dispose?.();
          },
        };
      },
    },
  ],
});


  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const port = process.env.PORT || 4000;
  httpServer.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:${port}${server.graphqlPath}`);
  });
}

start().catch((err) => {
  console.error("Fatal server start error", err);
});
