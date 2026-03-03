import { FastifyInstance, FastifyBaseLogger } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { IncomingMessage, Server, ServerResponse } from "node:http";

export type FastifyWithTypeProvider = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export const commonHTTPResponses = {
  400: {
    description: "Bad request, please check your request body",
    type: "null",
  },
  500: {
    description: "Internal server error, please try again later",
    type: "null",
  },
};
