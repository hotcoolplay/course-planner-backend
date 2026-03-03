import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import { FastifyWithTypeProvider } from "../../index.js";
import * as db from "../data-access/auth-db.js";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  fastify: FastifyWithTypeProvider,
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.createSession(fastify, session);
  return session;
}

export async function validateSessionToken(
  fastify: FastifyWithTypeProvider,
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await db.findSessionToken(fastify, sessionId);
  const user = { id: session.userId };
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.deleteSession(fastify, session.id);
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db.updateSession(fastify, session.id, session.expiresAt);
  }
  return { session, user };
}

export async function invalidateSession(
  fastify: FastifyWithTypeProvider,
  sessionId: string,
): Promise<void> {
  await db.deleteSession(fastify, sessionId);
}

export async function invalidateAllSessions(
  fastify: FastifyWithTypeProvider,
  userId: number,
): Promise<void> {
  await db.deleteAllUserSessions(fastify, userId);
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}

export interface User {
  id: number;
}
