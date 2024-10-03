import { FastifyInstance } from "fastify";

export async function insertCourses(fastify: FastifyInstance, course: Course) {
  const result = await fastify.pg.query(
    `INSERT INTO courses 
    VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    ON CONFLICT (subject, catalogNumber) DO UPDATE 
    SET courseid = $3, 
    units = $4, 
    component = $5,
    title = $6, 
    faculty = $7, 
    grading = $8, 
    completions = $9, 
    simultaneous_enrollment = $10, 
    description = $11 
    WHERE courses.subject = $1 
    AND courses.catalogNumber = $2
    RETURNING id`,
    [
      course.subjectcode,
      course.catalogNumber,
      course.courseid,
      course.units,
      course.component,
      course.title,
      course.faculty,
      course.grading,
      course.completions,
      course.simulEnroll,
      course.description,
    ],
  );
  return result.rows[0].id;
}

export async function insertTerms(fastify: FastifyInstance, term: Term) {
  await fastify.pg.query(
    `INSERT INTO terms(code, name) 
    VALUES($1, $2) 
    ON CONFLICT (code) DO UPDATE  
    SET name = $2 
    WHERE terms.code = $1`,
    [term.code, term.name],
  );
}

export async function getTerms(fastify: FastifyInstance): Promise<Term[]> {
  const gotTerms = await fastify.pg.query<Term>("SELECT name, code FROM terms");
  return gotTerms.rows;
}

export async function createTermTable(fastify: FastifyInstance, term: string) {
  const query = `CREATE TABLE IF NOT EXISTS ${term} (id SERIAL PRIMARY KEY, courseid VARCHAR(8) UNIQUE);`;
  await fastify.pg.query(query);
}

export async function insertTermCourses(
  fastify: FastifyInstance,
  term: string,
  id: string,
) {
  const query = `INSERT INTO ${term} (courseid) 
    VALUES($1) 
    ON CONFLICT (courseid) 
    DO NOTHING`;
  await fastify.pg.query(query, [id]);
}

export async function insertDegrees(fastify: FastifyInstance, degree: Degree) {
  const result = await fastify.pg.query(
    `INSERT INTO degrees 
        VALUES(DEFAULT, $1) 
        ON CONFLICT (name) DO NOTHING
        RETURNING id`,
    [degree.name],
  );
  return result;
}

export async function insertPrograms(
  fastify: FastifyInstance,
  program: Program,
) {
  const result = await fastify.pg.query(
    `INSERT INTO programs 
        VALUES(DEFAULT, $1, $2, $3) 
        ON CONFLICT (url_code)
        DO UPDATE SET
        name = excluded.name,
        program_subtype = excluded.program_subtype
        RETURNING id`,
    [program.name, program.programSubtype, program.urlCode],
  );
  return result;
}

export async function insertMajors(fastify: FastifyInstance, major: Major) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO programs 
        VALUES(DEFAULT, $1, $2, $3) 
        ON CONFLICT (url_code) 
        DO UPDATE SET
        name = excluded.name,
        program_subtype = excluded.program_subtype
        RETURNING id`,
      [major.name, major.programSubtype, major.urlCode],
    );
    const programId = result.rows[0].id;
    await client.query(
      `INSERT INTO majors 
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT (id) 
        DO UPDATE SET
        degree_id = excluded.degree_id,
        major_type = excluded.major_type,
        regular = excluded.regular,
        coop = excluded.coop`,
      [programId, major.degreeId, major.majorType, major.regular, major.coop],
    );
  });
}

export async function insertSpecializations(
  fastify: FastifyInstance,
  specialization: Specialization,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO programs 
            VALUES(DEFAULT, $1, $2, $3) 
            ON CONFLICT (url_code) 
            DO UPDATE SET
            name = excluded.name,
            program_subtype = excluded.program_subtype
            RETURNING id`,
      [
        specialization.name,
        specialization.programSubtype,
        specialization.urlCode,
      ],
    );
    const programId = result.rows[0].id;
    for (let i = 0; i < specialization.parentMajors.length; ++i) {
      await fastify.pg.query(
        `INSERT INTO major_specializations
                VALUES($1, $2)
                ON CONFLICT (specialization_id, major_id)
                DO NOTHING`,
        [programId, specialization.parentMajors[i]],
      );
    }
  });
}

export async function insertOptions(fastify: FastifyInstance, option: Option) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO programs 
              VALUES(DEFAULT, $1, $2, $3) 
              ON CONFLICT (url_code) 
              DO UPDATE SET
              name = excluded.name,
              program_subtype = excluded.program_subtype
              RETURNING id`,
      [option.name, option.programSubtype, option.urlCode],
    );
    const programId = result.rows[0].id;
    for (let i = 0; i < option.parentDegrees.length; ++i) {
      await fastify.pg.query(
        `INSERT INTO degree_options
                  VALUES($1, $2)
                  ON CONFLICT (degree_id, option_id)
                  DO NOTHING`,
        [option.parentDegrees[i], programId],
      );
    }
  });
}
