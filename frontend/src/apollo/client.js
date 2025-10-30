import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql", // 🔗 your backend endpoint
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql", // 🔥 subscription support
  })
);

// 🧠 Split links so queries/mutations use HTTP, and subscriptions use WS
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
