import { FastifyWithTypeProvider } from "./api.js";

export async function getCourses(
  fastify: FastifyWithTypeProvider,
): Promise<Course[]> {
  const gotList = await fastify.pg.query<Course>("SELECT * FROM courses");
  return gotList.rows;
}

export async function fetchCourse(
  fastify: FastifyWithTypeProvider,
  courseid: string,
): Promise<Course[]> {
  const gotCourse = await fastify.pg.query<Course>(
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
): Promise<Program[]> {
  const gotList = await fastify.pg.query<Program>("SELECT * FROM programs");
  return gotList.rows;
}

export async function fetchProgram(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<Program> {
  const gotProgram = await fastify.pg.query<Program>(
    "SELECT * FROM programs WHERE id = $1",
    [id],
  );
  return gotProgram.rows[0];
  return gotProgram.rows[0];
}
