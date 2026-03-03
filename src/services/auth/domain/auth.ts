import {
  decodeIdToken,
  generateState,
  generateCodeVerifier,
  OAuth2Tokens,
} from "arctic";
import { ObjectParser } from "@pilcrowjs/object-parser";

import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
} from "./session.js";
import { FastifyWithTypeProvider } from "../../index.js";
import * as db from "../data-access/auth-db.js";

export async function login(
  fastify: FastifyWithTypeProvider,
): Promise<CookieProperties> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = fastify.google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
  ]);
  return { state: state, codeVerifier: codeVerifier, url: url.toString() };
}

export async function loginCallback(
  fastify: FastifyWithTypeProvider,
  url: URL,
  cookies: CookieStore,
): Promise<CookieCallbackProperties | null> {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies.google_oauth_state ?? null;
  const codeVerifier = cookies.google_code_verifier ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    fastify.log.info(
      `One of code, state, storedState, or codeVerifier is null: ${code}, ${state}, ${storedState}, ${codeVerifier}`,
    );
    return null;
  }
  if (state !== storedState) {
    fastify.log.info(`State doesn't equal storedState`);
    return null;
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await fastify.google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    fastify.log.info(`Invalid code or client credentials`);
    return null;
  }
  const claims = decodeIdToken(tokens.idToken());
  const claimsParser = new ObjectParser(claims);

  const googleId = claimsParser.getString("sub");

  const existingUser = await db.getUserFromGoogleId(fastify, googleId);

  if (existingUser) {
    const sessionToken = generateSessionToken();
    const session = await createSession(fastify, sessionToken, existingUser.id);
    return { token: sessionToken, expiresAt: session.expiresAt };
  }

  const user = await db.createUser(fastify, googleId);

  const sessionToken = generateSessionToken();
  const session = await createSession(fastify, sessionToken, user.id);
  return { token: sessionToken, expiresAt: session.expiresAt };
}

export async function authenticateUser(
  fastify: FastifyWithTypeProvider,
  token: string,
) {
  return await validateSessionToken(fastify, token);
}

export async function logout(
  fastify: FastifyWithTypeProvider,
  token: string,
): Promise<boolean> {
  //eslint-disable-next-line
  if (token === "") return false;
  const { session } = await validateSessionToken(fastify, token);
  if (!session) return false;
  await invalidateSession(fastify, session.id);
  return true;
}

interface CookieStore {
  [cookieName: string]: string | undefined;
}

interface CookieProperties {
  state: string;
  codeVerifier: string;
  url: string;
}

interface CookieCallbackProperties {
  token: string;
  expiresAt: Date;
}
