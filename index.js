const { ApolloServer, gql, PubSub } = require("apollo-server");

// Type checking
// Query vs. mutation
// Objects
// Arrays
// Arguments

// CRUD

const typeDefs = gql`
  type Query {
    hello(name: String): String
    user: User
    errorLogs: [Error!]!
  }

  type User {
    id: ID!
    username: String
    firstLetterOfUsername: String
  }

  type Error {
    field: String!
    message: String!
  }

  type RegisterResponse {
    user: User
  }

  input UserInfo {
    username: String!
    password: String!
    age: Int
  }

  type Mutation {
    register(userInfo: UserInfo!): RegisterResponse!
    login(userInfo: UserInfo!): String!
  }

  type Subscription {
    newUser: User!
  }
`;

const NEW_USER = "NEW_USER";

const resolvers = {
  Subscription: {
    newUser: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_USER)
    }
  },
  User: {
    firstLetterOfUsername: parent => {
      return parent.username ? parent.username[0] : null;
    }
    // username: parent => { return parent.username;
    // }
  },
  Query: {
    hello: (parent, { name }) => {
      return `hey ${name}`;
    },
    user: () => ({
      id: 1,
      username: "tom"
    }),
    errorLogs: () => ([
      {
        field: "username",
        message: "bad"
      },
      {
        field: "username2",
        message: "bad2"
      }
    ])
  },
  Mutation: {
    login: async (parent, { userInfo: { username } }, context) => {
      // check the password
      // await checkPassword(password);
      return username;
    },
    register: (_, { userInfo: { username } }, { pubsub }) => {
      const user = {
        id: 1,
        username
      };

      pubsub.publish(NEW_USER, {
        newUser: user
      });

      return {
        user
      };
    }
  }
};

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub })
});

server.listen(4001)
  .then(({ url }) => console.log(`Server started at ${url}`));
