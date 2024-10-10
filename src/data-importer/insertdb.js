export async function insertCourses(fastify, course) {
    const result = await fastify.pg.query(`INSERT INTO courses 
    VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    ON CONFLICT (subject, catalog_number) DO UPDATE 
    SET courseid = $3, 
    units = $4, 
    faculty = $5,
    component = $6, 
    completions = $7, 
    simultaneous_enrollment = $8, 
    grading = $9, 
    title = $10, 
    description = $11 
    WHERE courses.subject = $1 
    AND courses.catalog_number = $2
    RETURNING id`, [
        course.subjectcode,
        course.catalogNumber,
        course.courseid,
        course.units,
        course.faculty,
        course.component,
        course.completions,
        course.simulEnroll,
        course.grading,
        course.title,
        course.description,
    ]);
    return result.rows[0].id;
}
export async function insertTerms(fastify, term) {
    await fastify.pg.query(`INSERT INTO terms(code, name) 
    VALUES($1, $2) 
    ON CONFLICT (code) DO UPDATE  
    SET name = $2 
    WHERE terms.code = $1`, [term.code, term.name]);
}
export async function getTerms(fastify) {
    const gotTerms = await fastify.pg.query("SELECT name, code FROM terms");
    return gotTerms.rows;
}
export async function createTermTable(fastify, term) {
    const query = `CREATE TABLE IF NOT EXISTS ${term} (id SERIAL PRIMARY KEY, courseid VARCHAR(8) UNIQUE);`;
    await fastify.pg.query(query);
}
export async function insertTermCourses(fastify, term, id) {
    const query = `INSERT INTO ${term} (courseid) 
    VALUES($1) 
    ON CONFLICT (courseid) 
    DO NOTHING`;
    await fastify.pg.query(query, [id]);
}
export async function insertDegrees(fastify, degree) {
    const result = await fastify.pg.query(`INSERT INTO degrees 
        VALUES(DEFAULT, $1) 
        ON CONFLICT (name) DO NOTHING
        RETURNING id`, [degree.name]);
    return result;
}
export async function insertPrograms(fastify, program) {
    const result = await fastify.pg.query(`INSERT INTO programs 
        VALUES(DEFAULT, $1, $2, $3) 
        ON CONFLICT (url_code)
        DO UPDATE SET
        name = excluded.name,
        program_subtype = excluded.program_subtype
        RETURNING id`, [program.name, program.programSubtype, program.urlCode]);
    return result;
}
export async function insertMajors(fastify, major) {
    await fastify.pg.transact(async (client) => {
        const result = await client.query(`INSERT INTO programs 
        VALUES(DEFAULT, $1, $2, $3) 
        ON CONFLICT (url_code) 
        DO UPDATE SET
        name = excluded.name,
        program_subtype = excluded.program_subtype
        RETURNING id`, [major.name, major.programSubtype, major.urlCode]);
        const programId = result.rows[0].id;
        await client.query(`INSERT INTO majors 
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT (id) 
        DO UPDATE SET
        degree_id = excluded.degree_id,
        major_type = excluded.major_type,
        regular = excluded.regular,
        coop = excluded.coop`, [programId, major.degreeId, major.majorType, major.regular, major.coop]);
    });
}
export async function insertSpecializations(fastify, specialization) {
    await fastify.pg.transact(async (client) => {
        const result = await client.query(`INSERT INTO programs 
            VALUES(DEFAULT, $1, $2, $3) 
            ON CONFLICT (url_code) 
            DO UPDATE SET
            name = excluded.name,
            program_subtype = excluded.program_subtype
            RETURNING id`, [
            specialization.name,
            specialization.programSubtype,
            specialization.urlCode,
        ]);
        const programId = result.rows[0].id;
        for (let i = 0; i < specialization.parentMajors.length; ++i) {
            await fastify.pg.query(`INSERT INTO major_specializations
                VALUES($1, $2)
                ON CONFLICT (specialization_id, major_id)
                DO NOTHING`, [programId, specialization.parentMajors[i]]);
        }
    });
}
export async function insertOptions(fastify, option) {
    await fastify.pg.transact(async (client) => {
        const result = await client.query(`INSERT INTO programs 
              VALUES(DEFAULT, $1, $2, $3) 
              ON CONFLICT (url_code) 
              DO UPDATE SET
              name = excluded.name,
              program_subtype = excluded.program_subtype
              RETURNING id`, [option.name, option.programSubtype, option.urlCode]);
        const programId = result.rows[0].id;
        for (let i = 0; i < option.parentDegrees.length; ++i) {
            await fastify.pg.query(`INSERT INTO degree_options
                  VALUES($1, $2)
                  ON CONFLICT (degree_id, option_id)
                  DO NOTHING`, [option.parentDegrees[i], programId]);
        }
    });
}
