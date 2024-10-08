export async function fetchDegreeId(fastify, name) {
    const result = await fastify.pg.query(`SELECT id FROM degrees
        WHERE name = $1`, [name]);
    return result.rows[0].id;
}
export async function searchDegreeId(fastify, name) {
    const result = await fastify.pg.query(`SELECT majors.degree_id AS degree_id
        FROM majors
        INNER JOIN programs
        USING (id)
        WHERE programs.name LIKE $1`, [name]);
    return result.rows[0].degree_id;
}
export async function searchMajorRegular(fastify, name) {
    const result = await fastify.pg.query(`SELECT majors.regular AS regular
        FROM majors
        INNER JOIN programs
        USING (id)
        WHERE programs.name LIKE $1`, [name]);
    return result.rows[0].regular;
}
export async function searchMajorCoop(fastify, name) {
    const result = await fastify.pg.query(`SELECT majors.coop AS coop
        FROM majors
        INNER JOIN programs
        USING (id)
        WHERE programs.name LIKE $1`, [name]);
    return result.rows[0].coop;
}
export async function searchProgramIds(fastify, name, opts) {
    try {
        if (opts.parentDegree) {
            let query = `SELECT programs.id AS id
        FROM programs
        INNER JOIN majors
        USING (id)
        WHERE programs.name LIKE $1 
        AND majors.degree_id = $2`;
            if (opts.majorType) {
                query += " AND majors.major_type = $3";
                const result = await fastify.pg.query(query, [
                    name + "%(%",
                    opts.parentDegree,
                    opts.majorType,
                ]);
                return result.rows[0].id;
            }
            const result = await fastify.pg.query(query, [
                name + "%(%",
                opts.parentDegree,
            ]);
            return result.rows[0].id;
        }
        else if (opts.parentProgram) {
            const query = `SELECT pa.id AS id
    FROM programs AS pa
    INNER JOIN major_specializations AS ms
    ON pa.id = ms.specialization_id
    INNER JOIN programs AS pb
    ON ms.major_id = pb.id
    WHERE pa.name LIKE $1
    AND pb.name LIKE $2`;
            const result = await fastify.pg.query(query, [
                name,
                opts.parentProgram === "Computer Science"
                    ? "%" + opts.parentProgram + "%(%"
                    : opts.parentProgram + "%(%",
            ]);
            return result.rows[0].id;
        }
        else if (opts.majorType) {
            const query = `SELECT programs.id AS id
    FROM programs
    INNER JOIN majors
    USING (id)
    WHERE programs.name LIKE $1
    AND majors.major_type = $2`;
            const result = await fastify.pg.query(query, [
                name + "%(%",
                opts.majorType,
            ]);
            return result.rows[0].id;
        }
        else {
            const query = `SELECT id FROM programs
    WHERE programs.name LIKE $1`;
            const result = await fastify.pg.query(query, [name]);
            return result.rows[0].id;
        }
    }
    catch (err) {
        console.error(err);
        throw new Error(`Couldn't find ID for ${name}, ${opts.parentDegree}, ${opts.majorType}, ${opts.parentProgram}}!`);
    }
}
export async function searchCourseIds(fastify, subject, catalogNumber) {
    const result = await fastify.pg.query(`SELECT id FROM courses
    WHERE subject = $1
    AND catalog_number = $2`, [subject, catalogNumber]);
    try {
        return result.rows[0].id;
    }
    catch (err) {
        console.error(err);
        throw new Error(`Couldn't find ID for ${subject + catalogNumber}`);
    }
}
