import { FastifyWithTypeProvider } from "./api.js";

export async function getCourses(
  fastify: FastifyWithTypeProvider,
): Promise<RetrievedEntity<Course>[]> {
  const gotList = await fastify.pg.query<RetrievedEntity<Course>>(
    "SELECT * FROM courses",
  );
  return gotList.rows;
}

export async function fetchCourseByCourseId(
  fastify: FastifyWithTypeProvider,
  courseid: string,
): Promise<RetrievedEntity<Course>[]> {
  const gotCourse = await fastify.pg.query<RetrievedEntity<Course>>(
    `SELECT * FROM courses 
        WHERE courseid = $1`,
    [courseid],
  );
  return gotCourse.rows;
}

export async function fetchCourseByTerm(
  fastify: FastifyWithTypeProvider,
  term: string,
): Promise<{ courseid: string }[]> {
  const query = `SELECT courseid FROM ${term}`;
  const gotCourseList = await fastify.pg.query<{ courseid: string }>(query);
  return gotCourseList.rows;
}

export async function fetchPrograms(
  fastify: FastifyWithTypeProvider,
): Promise<RetrievedEntity<Program>[]> {
  const gotList = await fastify.pg.query<RetrievedEntity<Program>>(
    "SELECT * FROM programs",
  );
  return gotList.rows;
}

export async function fetchProgramById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<RetrievedEntity<Program>> {
  const gotProgram = await fastify.pg.query<RetrievedEntity<Program>>(
    "SELECT * FROM programs WHERE id = $1",
    [id],
  );
  return gotProgram.rows[0];
}
