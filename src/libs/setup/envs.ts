import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fe from "@fastify/env";

const setupOptions = {
  schema: {
    type: "object",
    required: [
      "HOST",
      "PORT",
      "DB_ID",
      "DB_PWD",
      "DB_HOST",
      "DB_NAME",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "FRONTEND_URL",
      "NODE_ENV",
    ],
    properties: {
      HOST: {
        type: "string",
      },
      PORT: {
        type: "string",
      },
      DB_PGUSER: {
        type: "string",
      },
      DB_PGPASSWORD: {
        type: "string",
      },
      DB_PGHOST: {
        type: "string",
      },
      DB_PGDATABSE: {
        type: "string",
      },
      GOOGLE_CLIENT_ID: {
        type: "string",
      },
      GOOGLE_CLIENT_SECRET: {
        type: "string",
      },
      FRONTEND_URL: {
        type: "string",
      },
      NODE_ENV: {
        type: "string",
      },
    },
  },
  dotenv: true,
};

async function envConnector(fastify: FastifyInstance) {
  fastify.register(fe, setupOptions);
}

export default fp(envConnector);
