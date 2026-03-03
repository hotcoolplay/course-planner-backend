import { FastifyWithTypeProvider } from "../../index.js";

import {
  CourseDTO,
  PrerequisiteDTO,
  ParentPrerequisiteDTO,
  OtherPrerequisiteDTO,
  DegreePrerequisiteDTO,
  CoursePrerequisiteDTO,
  ProgramPrerequisiteDTO,
  LevelPrerequisiteDTO,
  PseudoCoursePrerequisiteDTO,
  PseudoProgramPrerequisiteDTO,
  CumulativeAveragePrerequisiteDTO,
  MajorAveragePrerequisiteDTO,
} from "../domain/course-schema";

export async function getCourses(
  fastify: FastifyWithTypeProvider,
): Promise<CourseDTO[]> {
  const gotList = await fastify.pg.query<CourseDTO>(
    `SELECT id, subject, catalog_number AS "catalogNumber", courseid, units, faculty, 
    component, completions, simultaneous_enrollment AS "simulEnroll", grading, title,
    description 
    FROM courses`,
  );
  return gotList.rows;
}

export async function getPrerequisites(
  fastify: FastifyWithTypeProvider,
  courseId: number,
): Promise<PrerequisiteDTO[]> {
  const result = await fastify.pg.query<PrerequisiteDTO>(
    `WITH RECURSIVE prereqs AS (
	SELECT pe.id, pe.parent_id AS "parentPrerequisiteId", pe.requisite_type AS "requisiteType", \
  pe.course_id AS "parentCourseId", pe.requisite_subtype AS "requisiteSubtype" FROM prerequisites pe
	WHERE pe.course_id = $1
	UNION ALL
	SELECT pr.id, pr.parent_id AS "parentPrerequisiteId", pr.requisite_type AS "requisiteType", \
  pr.course_id AS "parentCourseId", pr.requisite_subtype AS "requisiteSubtype" FROM prerequisites pr
	INNER JOIN prereqs pq 
	ON pq.id = pr.parent_id
    )
    SELECT * FROM prereqs`,
    [courseId],
  );
  return result.rows;
}

export async function joinParentPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<ParentPrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", amount, grade, units, \
  program_average AS "programAverage" FROM prerequisites
    INNER JOIN parent_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<ParentPrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinOtherPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<OtherPrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", prerequisite FROM prerequisites
    INNER JOIN other_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<OtherPrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinCoursePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<CoursePrerequisiteDTO> {
  const query = `SELECT pr.id, pr.parent_id AS "parentPrerequisiteId", \
  pr.requisite_type AS "requisiteType", pr.course_id AS "parentCourseId", \
  pr.requisite_subtype AS "requisiteSubtype", cp.course_id AS "courseId" FROM prerequisites pr
    INNER JOIN course_prerequisites cp
    ON pr.id = cp.id
    WHERE pr.id = $1`;
  const result = await fastify.pg.query<CoursePrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinProgramPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<ProgramPrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", \
  program_id AS "programId" FROM prerequisites
    INNER JOIN program_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<ProgramPrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinDegreePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<DegreePrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", \
  degree_id AS "degreeId" FROM prerequisites
    INNER JOIN degree_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<DegreePrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinLevelPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<LevelPrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", level FROM prerequisites
    INNER JOIN level_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<LevelPrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinPseudoCoursePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<PseudoCoursePrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", subject, \
  catalog_number AS "catalogNumber", min_catalog_number AS "minCatalogNumber", \
  max_catalog_number AS "maxCatalogNumber", topic, term, component FROM prerequisites
    INNER JOIN pseudo_course_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<PseudoCoursePrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinPseudoProgramPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<PseudoProgramPrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", faculty, \
  major_type AS "majorType", major_system AS "majorSystem" FROM prerequisites
    INNER JOIN pseudo_program_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<PseudoProgramPrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function joinCumulativeAveragePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<CumulativeAveragePrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", average FROM prerequisites
    INNER JOIN cumulative_average_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<CumulativeAveragePrerequisiteDTO>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinMajorAveragePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<MajorAveragePrerequisiteDTO> {
  const query = `SELECT id, parent_id AS "parentPrerequisiteId", requisite_type AS "requisiteType", \
  course_id AS "parentCourseId", requisite_subtype AS "requisiteSubtype", \
  major_average AS "majorAverage" FROM prerequisites
    INNER JOIN major_average_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<MajorAveragePrerequisiteDTO>(query, [
    prerequisiteId,
  ]);
  return result.rows[0];
}

export async function fetchCourseById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<CourseDTO> {
  const gotCourse = await fastify.pg.query<CourseDTO>(
    `SELECT id, subject, catalog_number AS "catalogNumber", courseid, units, faculty, \
    component, completions, simultaneous_enrollment AS "simulEnroll", grading, title, \
    description FROM courses 
        WHERE id = $1`,
    [id],
  );
  return gotCourse.rows[0];
}

export async function fetchCourseByCourseId(
  fastify: FastifyWithTypeProvider,
  courseid: string,
): Promise<CourseDTO[]> {
  const gotCourse = await fastify.pg.query<CourseDTO>(
    `SELECT id, subject, catalog_number AS "catalogNumber", courseid, units, faculty, \
    component, completions, simultaneous_enrollment AS "simulEnroll", grading, title, \
    description FROM courses 
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
