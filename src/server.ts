import cookies from "@fastify/cookie";
import cors from "@fastify/cors";
import fastify, { FastifyInstance } from "fastify";

import envs from "./libs/setup/envs.js";
import db from "./libs/setup/db.js";
import cookieValidator from "./libs/validators/cookie-validator.js";
import * as errorHandling from "./libs/error-handling/index.js";
import google from "./libs/setup/google.js";

import courseRoutes from "./services/courses/api/course-routes.js";
import programRoutes from "./services/programs/api/program-routes.js";
import authRoutes from "./services/auth/api/auth-routes.js";
import planRoutes from "./services/plans/api/plan-routes.js";

const server = fastify({
  logger: true,
});

const verifyOrigin = (
  origin: string | undefined,
  cb: (err: Error | null, origin: string | boolean | RegExp) => void,
): void => {
  if (!origin) {
    cb(null, true);
    return;
  }
  const hostname = new URL(origin).hostname;
  if (hostname === "localhost") {
    cb(null, true);
    return;
  }
  cb(new Error("Not allowed"), false);
};

async function registerPlugins(fastify: FastifyInstance) {
  await fastify.register(envs);
  fastify.register(db);
  fastify.register(cookies);
  fastify.register(cookieValidator);
  fastify.register(google);
  fastify.register(cors, {
    origin: verifyOrigin,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
  });
}

async function registerRoutes(fastify: FastifyInstance) {
  fastify.register(courseRoutes);
  fastify.register(programRoutes);
  fastify.register(authRoutes);
  fastify.register(planRoutes);
}

async function startServer(fastify: FastifyInstance) {
  await registerPlugins(fastify);
  await registerRoutes(fastify);
  fastify.setErrorHandler(errorHandling.apiErrorHandler);
  fastify.listen(
    { host: process.env.HOST, port: Number(process.env.PORT) },
    (err, address: string) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
      server.log.info(`Server listening at ${address}`);
    },
  );
}

startServer(server);
