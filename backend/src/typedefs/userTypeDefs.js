export const userTypeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    status: String!
    created_at: String
  }
      type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type Query {
    _dummy: String
  }

  type Mutation {
    register(email: String!, password: String!): User
        login(email: String!, password: String!): AuthPayload
    refreshToken(token: String!): AuthPayload
  }
`;
