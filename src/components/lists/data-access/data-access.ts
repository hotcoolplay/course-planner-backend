import { FastifyWithTypeProvider } from "../../index.js";
import { RetrievedEntity } from "../../index.js";

export async function getCourses(
  fastify: FastifyWithTypeProvider,
): Promise<RetrievedEntity<Course>[]> {
  const gotList = await fastify.pg.query<RetrievedEntity<Course>>(
    "SELECT * FROM courses",
  );
  return gotList.rows;
}

export async function getPrerequisites(
  fastify: FastifyWithTypeProvider,
  courseId: number,
): Promise<RetrievedEntity<Prerequisite>[]> {
  const result = await fastify.pg.query<RetrievedEntity<Prerequisite>>(
    `WITH RECURSIVE prereqs AS (
	SELECT pe.* FROM prerequisites AS pe
	WHERE pe.course_id = $1
	UNION ALL
	SELECT pr.* FROM prerequisites pr
	INNER JOIN prereqs pq 
	ON pq.id = pr.parent_id
    )
    SELECT * FROM prereqs`,
    [courseId],
  );
  return result.rows;
}

export async function joinPrerequisite<T>(
  fastify: FastifyWithTypeProvider,
  type: requisiteSubtype,
  prerequisiteId: number,
): Promise<RetrievedEntity<T>> {
  const tableName = type.match(/[A-Z]/)
    ? `${type.split(/[A-Z]/)[0]}_${type.split(/[A-Z]/)[1]}_prerequisites`
    : `${type}_prerequisites`;
  const query = `SELECT * FROM prerequisites
    INNER JOIN ${tableName}
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<T>>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function fetchCourseById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<RetrievedEntity<Course>> {
  const gotCourse = await fastify.pg.query<RetrievedEntity<Course>>(
    `SELECT * FROM courses 
        WHERE id = $1`,
    [id],
  );
  return gotCourse.rows[0];
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
