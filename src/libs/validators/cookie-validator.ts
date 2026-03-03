import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { validateSessionToken } from "../../services/auth/domain/session.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: number | null;
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
  }
}

function cookieValidator(fastify: FastifyInstance) {
  fastify.decorateRequest("userId", null);
  fastify.decorate(
    "authenticate",
    async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
      const token = req.cookies.session ?? "";
      //eslint-disable-next-line
      if (token !== "") {
        const { user } = await validateSessionToken(fastify, token);
        if (user === null) {
          res.cookie("session", "", {
            path: "/",
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          res.code(401);
          res.redirect("/");
        } else {
          res.cookie("session", token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          req.userId = user.id;
        }
      } else {
        res.code(401);
        res.send("Invalid session!");
      }
    },
  );
  fastify.addHook(
    "onRequest",
    async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
      if (req.method !== "GET") {
        const origin = req.headers.origin;
        if (origin === null || origin !== process.env.FRONTEND_URL) {
          res.code(403);
          res.send("Invalid request origin!");
        }
      }
    },
  );
}

export default fp(cookieValidator);
