import { FastifyWithTypeProvider } from "../../index.js";
import { RetrievedEntity } from "../../index.js";

export async function getCourses(
  fastify: FastifyWithTypeProvider,
): Promise<RetrievedEntity<Course>[]> {
  const gotList = await fastify.pg.query<RetrievedEntity<Course>>(
    'SELECT id, subject, catalog_number AS "catalogNumber", courseid, units, faculty, \
    component, completions, simultaneous_enrollment AS "simulEnroll", grading, title, \
    description FROM courses',
  );
  return gotList.rows;
}

export async function getPrerequisites(
  fastify: FastifyWithTypeProvider,
  courseId: number,
): Promise<RetrievedEntity<Prerequisite>[]> {
  const result = await fastify.pg.query<RetrievedEntity<Prerequisite>>(
    `WITH RECURSIVE prereqs AS (
	SELECT pe.id, pe.parent_id AS "parentId", pe.requisite_type AS "requisiteType", pe.requisite_subtype AS "requisiteSubtype" FROM prerequisites pe
	WHERE pe.course_id = $1
	UNION ALL
	SELECT pr.id, pr.parent_id AS "parentId", pr.requisite_type AS "requisiteType", pr.requisite_subtype AS "requisiteSubtype" FROM prerequisites pr
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
): Promise<RetrievedEntity<ParentPrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", amount, grade, units, \
  program_average AS "programAverage" FROM prerequisites
    INNER JOIN parent_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<ParentPrerequisite>>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinOtherPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<OtherPrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", prerequisite FROM prerequisites
    INNER JOIN other_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<OtherPrerequisite>>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinCoursePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<CoursePrerequisite>> {
  const query = `SELECT pr.id, pr.parent_id AS "parentId", pr.requisite_type AS "requisiteType", \
  pr.requisite_subtype AS "requisiteSubtype", cp.course_id AS "courseId" FROM prerequisites pr
    INNER JOIN course_prerequisites cp
    ON pr.id = cp.id
    WHERE pr.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<CoursePrerequisite>>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinProgramPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<ProgramPrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", program_id AS "programId" FROM prerequisites
    INNER JOIN program_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<ProgramPrerequisite>>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinDegreePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<DegreePrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", degree_id AS "degreeId" FROM prerequisites
    INNER JOIN degree_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<DegreePrerequisite>>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinLevelPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<LevelPrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", level FROM prerequisites
    INNER JOIN level_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<RetrievedEntity<LevelPrerequisite>>(
    query,
    [prerequisiteId],
  );
  return result.rows[0];
}

export async function joinPseudoCoursePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<PseudoCoursePrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", subject, catalog_number AS "catalogNumber", \
  min_catalog_number AS "minCatalogNumber", max_catalog_number AS "maxCatalogNumber", \
  topic, term, component FROM prerequisites
    INNER JOIN pseudo_course_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<
    RetrievedEntity<PseudoCoursePrerequisite>
  >(query, [prerequisiteId]);
  return result.rows[0];
}

export async function joinPseudoProgramPrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<PseudoProgramPrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", faculty, major_type AS "majorType", \
  major_system AS "majorSystem" FROM prerequisites
    INNER JOIN pseudo_program_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<
    RetrievedEntity<PseudoProgramPrerequisite>
  >(query, [prerequisiteId]);
  return result.rows[0];
}

export async function joinCumulativeAveragePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<CumulativeAveragePrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", average FROM prerequisites
    INNER JOIN cumulative_average_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<
    RetrievedEntity<CumulativeAveragePrerequisite>
  >(query, [prerequisiteId]);
  return result.rows[0];
}

export async function joinMajorAveragePrerequisite(
  fastify: FastifyWithTypeProvider,
  prerequisiteId: number,
): Promise<RetrievedEntity<MajorAveragePrerequisite>> {
  const query = `SELECT id, parent_id AS "parentId", requisite_type AS "requisiteType", \
  requisite_subtype AS "requisiteSubtype", major_average AS "majorAverage" FROM prerequisites
    INNER JOIN major_average_prerequisites
    USING (id)
    WHERE prerequisites.id = $1`;
  const result = await fastify.pg.query<
    RetrievedEntity<MajorAveragePrerequisite>
  >(query, [prerequisiteId]);
  return result.rows[0];
}

export async function fetchCourseById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<RetrievedEntity<Course>> {
  const gotCourse = await fastify.pg.query<RetrievedEntity<Course>>(
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
): Promise<RetrievedEntity<Course>[]> {
  const gotCourse = await fastify.pg.query<RetrievedEntity<Course>>(
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

export async function fetchMajors(
  fastify: FastifyWithTypeProvider,
): Promise<RetrievedEntity<Major>[]> {
  const gotList = await fastify.pg.query<RetrievedEntity<Major>>(
    `SELECT id, name, program_subtype AS "programSubtype", degree_id AS "degreeId", \
    major_type AS "majorType", regular, coop FROM programs
    INNER JOIN majors
    USING (id)`,
  );
  return gotList.rows;
}

export async function fetchMajorById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<RetrievedEntity<Major>> {
  const gotMajor = await fastify.pg.query<RetrievedEntity<Major>>(
    `SELECT id, name, program_subtype AS "programSubtype", degree_id AS "degreeId", \
    major_type AS "majorType", regular, coop FROM programs
    INNER JOIN majors
    USING (id)
    WHERE id = $1`,
    [id],
  );
  return gotMajor.rows[0];
}

export async function fetchMajorSequences(
  fastify: FastifyWithTypeProvider,
  majorId: number,
  degreeId: number,
): Promise<Sequence[]> {
  let sequences = await fastify.pg.query<Sequence>(
    `SELECT name, sequence FROM sequences
    WHERE major_id = $1`,
    [majorId],
  );
  //If no sequences in major check degree sequences
  if (!sequences.rows) {
    sequences = await fastify.pg.query<Sequence>(
      `SELECT name, sequence FROM sequences
      WHERE degree_id = $1`,
      [degreeId],
    );
  }
  return sequences.rows;
}

export async function fetchMajorExtensions(
  fastify: FastifyWithTypeProvider,
  majorId: number,
  degreeId: number,
): Promise<RetrievedEntity<Program>[]> {
  const diplomasAndMinors = await fastify.pg.query<RetrievedEntity<Program>>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs
    WHERE program_subtype = 'Diploma'
	OR program_subtype = 'Minor'`,
  );
  const specializations = await fastify.pg.query<RetrievedEntity<Program>>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs p
INNER JOIN major_specializations ms
ON p.id = ms.specialization_id
WHERE ms.major_id = $1`,
    [majorId],
  );
  const options = await fastify.pg.query<RetrievedEntity<Program>>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs p
INNER JOIN degree_options deo
ON p.id = deo.option_id
WHERE deo.degree_id = $1`,
    [degreeId],
  );
  const extensions = diplomasAndMinors.rows;
  extensions.push(...specializations.rows);
  extensions.push(...options.rows);
  return extensions;
}
