const { ApolloServer, PubSub } = require("apollo-server");

const path = require("path");
require("dotenv").config({
  path:
    typeof process.env.DOTENV_PATH !== "undefined"
      ? path.resolve(process.cwd(), process.env.DOTENV_PATH)
      : path.resolve(process.cwd(), ".env"),
});

const {
  ERRORS,
  ERROR_AUTHENTICATION_DATA_IS_MISSING,
  errorDescriptor,
} = require("./errors");
const { formatError } = require("./errors/formatError");

const EVENTS = require("./src/events");
const { typeDefs } = require("./src/schema");

const checkPassword = require("./src/checkPassword");

const users = [
  {
    id: 1,
    username: "Pero",
    password: "$2a$12$O1TQA8DweDP8RmnU89yHSeGALT.hm6DWBEQQ/iqgsqDO4AAwMhSZa",
    admin: true,
  },
];

const resolvers = {
  Subscription: {
    newUser: {
      subscribe: (_parent, _args, { pubsub }) =>
        pubsub.asyncIterator(EVENTS.NEW_USER),
    },
  },
  User: {
    firstLetterOfUsername: (parent) => {
      return parent.username ? parent.username[0] : null;
    },
    // username: parent => { return parent.username;
    // }
  },
  Query: {
    hello: (parent, { name }) => {
      return `hey ${name}`;
    },
    user: () => ({
      id: 1,
      username: "tom",
    }),
    errorLogs: () => [
      {
        field: "username",
        message: "bad",
      },
      {
        field: "username2",
        message: "bad2",
      },
    ],
  },
  Mutation: {
    login: async (parent, { userInfo: { username, password } }, context) => {
      await checkPassword(password);
      throw new Error(errorDescriptor(ERROR_AUTHENTICATION_DATA_IS_MISSING));
      return username;
    },
    register: (_, { userInfo: { username, password } }, { pubsub }) => {
      const user = {
        id: 1,
        username,
        password,
      };

      users.push(user);

      pubsub.publish(EVENTS.NEW_USER, {
        newUser: user,
      });

      return {
        user,
      };
    },
  },
};

const pubsub = new PubSub();

const timer = setInterval(() => {
  pubsub.publish(EVENTS.PING, {
    listenForPing: `${Date.now()}`,
  });
}, 3000);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
  formatError,
});

const port = process.env.PORT;

server.listen(port).then(({ url }) => console.log(`Server started at ${url}`));
