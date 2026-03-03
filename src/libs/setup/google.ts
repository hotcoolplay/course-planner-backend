import { Google } from "arctic";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function googleClient(fastify: FastifyInstance) {
  const google = new Google(
    process.env.GOOGLE_CLIENT_ID ?? "",
    process.env.GOOGLE_CLIENT_SECRET ?? "",
    "http://localhost:4000/login/google/callback",
  );
  fastify.decorate("google", google);
}

declare module "fastify" {
  interface FastifyInstance {
    google: Google;
  }
}

export default fp(googleClient);
