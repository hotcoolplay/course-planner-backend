import { FastifyWithTypeProvider } from "../../index.js";

import { Session } from "../domain/session.js";
import { UserDTO } from "../domain/user-schema.js";

export async function createSession(
  fastify: FastifyWithTypeProvider,
  session: Session,
): Promise<void> {
  await fastify.pg.query(
    `INSERT INTO user_sessions (id, user_id, expires_at) 
        VALUES ($1, $2, $3)`,
    [session.id, session.userId, session.expiresAt],
  );
}

export async function findSessionToken(
  fastify: FastifyWithTypeProvider,
  sessionId: string,
): Promise<Session> {
  const session = await fastify.pg.query<Session>(
    `SELECT user_sessions.id AS id, user_sessions.user_id AS "userId", user_sessions.expires_at AS "expiresAt" 
        FROM user_sessions 
        INNER JOIN users 
        ON users.id = user_sessions.user_id 
        WHERE user_sessions.id = $1`,
    [sessionId],
  );
  return session.rows[0];
}

export async function deleteSession(
  fastify: FastifyWithTypeProvider,
  sessionId: string,
): Promise<void> {
  await fastify.pg.query(
    `DELETE FROM user_sessions 
        WHERE id = $1`,
    [sessionId],
  );
}

export async function updateSession(
  fastify: FastifyWithTypeProvider,
  sessionId: string,
  sessionExpiryDate: Date,
): Promise<void> {
  await fastify.pg.query(
    `UPDATE user_session s
        SET expires_at = $1 
        WHERE id = $2`,
    [sessionExpiryDate, sessionId],
  );
}

export async function deleteAllUserSessions(
  fastify: FastifyWithTypeProvider,
  userId: number,
): Promise<void> {
  await fastify.pg.query(
    `DELETE FROM user_sessions 
            WHERE user_id = $1`,
    [userId],
  );
}

export async function checkEmailAvailability(
  fastify: FastifyWithTypeProvider,
  email: string,
) {
  const emailCount = await fastify.pg.query<{ count: number }>(
    `SELECT COUNT(*) FROM users WHERE email = $1`,
    [email],
  );
  return emailCount.rows[0].count === 0;
}

export async function getUserFromGoogleId(
  fastify: FastifyWithTypeProvider,
  googleId: string,
): Promise<UserDTO> {
  const users = await fastify.pg.query<UserDTO>(
    `SELECT id, google_id AS "googleId" FROM users WHERE google_id = $1`,
    [googleId],
  );
  return users.rows[0];
}

export async function createUser(
  fastify: FastifyWithTypeProvider,
  googleId: string,
): Promise<UserDTO> {
  const users = await fastify.pg.query<UserDTO>(
    `INSERT INTO users (google_id) 
        VALUES ($1)
        RETURNING id, google_id AS "googleId"`,
    [googleId],
  );
  return users.rows[0];
}
