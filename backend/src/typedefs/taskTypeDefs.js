export const taskTypeDefs = `#graphql
  type Task {
    id: ID!
    workspace_id: Int!
    title: String!
    description: String
    status: String!
    created_at: String
    updated_at: String
  }

  extend type Query {
    getTasks(workspace_id: Int!): [Task]
    getTaskById(id: ID!): Task
  }

  extend type Mutation {
    createTask(workspace_id: Int!, title: String!, description: String): Task
    updateTask(id: ID!, title: String, description: String, status: String): Task
    deleteTask(id: ID!): Boolean
  }
`;
