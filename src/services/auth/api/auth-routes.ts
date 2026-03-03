import * as domain from "../domain/auth.js";
import {
  urlSchema,
  callbackSchema,
  authSchema,
} from "../domain/user-schema.js";
import { FastifyWithTypeProvider, commonHTTPResponses } from "../../index.js";

async function authRoutes(fastify: FastifyWithTypeProvider) {
  fastify.get("/login/google", {
    schema: {
      response: {
        200: urlSchema,
        ...commonHTTPResponses,
      },
    },
    handler: async (req, res) => {
      fastify.log.info(`Google log in was requested`);
      const cookieInfo = await domain.login(fastify);
      res.cookie("google_oauth_state", cookieInfo.state, {
        path: "/",
        maxAge: 60 * 10, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.cookie("google_code_verifier", cookieInfo.codeVerifier, {
        path: "/",
        maxAge: 60 * 10, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.send(cookieInfo.url);
    },
  });
  fastify.get("/login/google/callback", {
    schema: {
      response: {
        302: callbackSchema,
        ...commonHTTPResponses,
      },
    },
    handler: async (req, res) => {
      fastify.log.info(`User using Google authentication...`);
      const url = new URL(req.url, "http://d");
      const cookieInfo = await domain.loginCallback(fastify, url, req.cookies);
      if (cookieInfo === null) {
        res.status(400);
        return;
      } else {
        res.cookie("session", cookieInfo.token, {
          path: "/",
          expires: cookieInfo.expiresAt,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        return;
      }
    },
  });
  fastify.get("/auth", {
    schema: {
      response: {
        200: authSchema,
        ...commonHTTPResponses,
      },
    },
    handler: async (req, res) => {
      fastify.log.info(`Authenticating user...`);
      const token = req.cookies.session ?? "";
      const { user } = await domain.authenticateUser(fastify, token);
      if (user === null) res.send(false);
      else res.send(true);
    },
  });
  fastify.delete("/logout", {
    schema: {
      response: {
        302: {
          description: "Successfully logged out user",
          type: "null",
        },
        401: {
          description: "Unauthorized action",
          type: "null",
        },
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`User logging out...`);
      const token = req.cookies.session ?? "";
      const loggedOut = await domain.logout(fastify, token);
      if (!loggedOut) {
        res.status(401);
        return;
      } else {
        res.cookie("session", "", {
          path: "/",
          maxAge: 0,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        res.redirect("/");
        return;
      }
    },
  });
}

export default authRoutes;
