import { FastifyInstance } from 'fastify'

export type PseudoCourseParents = 'Prerequisite' | 'Requirement' | 'Course List'

export async function insertCourses (fastify: FastifyInstance, course: Course) { 
    const result = await fastify.pg.query(`INSERT INTO courses 
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
    [course.subjectcode, course.catalogNumber, course.courseid, 
        course.units, course.component, course.title, course.faculty, course.grading, course.completions,
    course.simulEnroll, course.description])
    return result.rows[0].id
}

export async function insertPrerequisites (fastify: FastifyInstance, prereq: Prerequisite) {
    const result = await fastify.pg.query(`INSERT INTO prerequisites
        VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
        RETURNING id`, [prereq.parentId, prereq.requisiteType,
            prereq.courseId, prereq.requisiteSubtype, prereq.amount, prereq.grade])
    return result.rows[0].id
}

export async function insertCoursePrerequisites (fastify: FastifyInstance, prereq: CoursePrerequisite) {
    await fastify.pg.transact(async client => {
        const id = await client.query(`INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`, [prereq.parentId, prereq.requisiteType,
                prereq.courseId, prereq.requisiteSubtype, prereq.amount, prereq.grade])
        await client.query(`INSERT INTO course_prerequisites
            VALUES($1, $2)`,
        [id, prereq.units])
        if (prereq.pseudoCourses) {
            for (let i = 0; i < prereq.pseudoCourses.length; ++i) {
                fastify.pg.query(`INSERT INTO pseudo_courses
                    VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id`, [prereq.pseudoCourses[i].subject, prereq.pseudoCourses[i].catalogNumber,
                    prereq.pseudoCourses[i].minCatalogNumber, prereq.pseudoCourses[i].maxCatalogNumber, 
                        id, null, null, prereq.pseudoCourses[i].topic, prereq.pseudoCourses[i].term,
                        prereq.pseudoCourses[i].component, prereq.pseudoCourses[i].faculty])
            }
        }
    })
}

export async function insertProgramPrerequisites (fastify: FastifyInstance, prereq: ProgramPrerequisite) {
    await fastify.pg.transact(async client => {
        const id = await client.query(`INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`, [prereq.parentId, prereq.requisiteType,
                prereq.courseId, prereq.requisiteSubtype, prereq.amount, prereq.grade])
        await client.query(`INSERT INTO program_prerequisites
            VALUES($1, $2, $3)`,
        [id, prereq.averageType, prereq.average])
    })
}

export async function insertLevelPrerequisites (fastify: FastifyInstance, prereq: LevelPrerequisite) {
    await fastify.pg.transact(async client => {
        const id = await client.query(`INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`, [prereq.parentId, prereq.requisiteType,
                prereq.courseId, prereq.requisiteSubtype, prereq.amount, prereq.grade])
        await client.query(`INSERT INTO level_prerequisites
            VALUES($1, $2)`,
        [id, prereq.level])
    })
}

export async function insertOtherPrerequisites (fastify: FastifyInstance, prereq: OtherPrerequisite) {
    await fastify.pg.transact(async client => {
        const id = await client.query(`INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`, [prereq.parentId, prereq.requisiteType,
                prereq.courseId, prereq.requisiteSubtype, prereq.amount, prereq.grade])
        await client.query(`INSERT INTO other_prerequisites
            VALUES($1, $2)`,
        [id, prereq.other])
    })
}

export async function insertPrerequisiteCourses (fastify: FastifyInstance, prerequisiteId: number, subject: string, catalogNumber: string) {
    await fastify.pg.transact(async client => {
        const courseId = await client.query(`SELECT id FROM courses
            WHERE courses.subject = $1
            AND courses.catalognumber = $2`, [subject, catalogNumber])
        await client.query(`INSERT INTO prerequisite_courses
            VALUES($1, $2)`,
        [prerequisiteId, courseId])
    })
}

export async function insertPseudoCourses (fastify: FastifyInstance, id: number, pseudoCourse: PseudoCourse, parent: PseudoCourseParents) {
    if (parent === 'Prerequisite') {
        await fastify.pg.query(`INSERT INTO pseudo_courses
                VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`, [pseudoCourse.subject, pseudoCourse.catalogNumber,
                    pseudoCourse.minCatalogNumber, pseudoCourse.maxCatalogNumber, 
                    id, null, null, pseudoCourse.topic, pseudoCourse.term,
                    pseudoCourse.component, pseudoCourse.faculty])
    }
    else if (parent === 'Requirement') {
        await fastify.pg.query(`INSERT INTO pseudo_courses
                VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`, [pseudoCourse.subject, pseudoCourse.catalogNumber,
                    pseudoCourse.minCatalogNumber, pseudoCourse.maxCatalogNumber, 
                    null, id, null, pseudoCourse.topic, pseudoCourse.term,
                    pseudoCourse.component, pseudoCourse.faculty])
    }
    else {
        await fastify.pg.query(`INSERT INTO pseudo_courses
                VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`, [pseudoCourse.subject, pseudoCourse.catalogNumber,
                    pseudoCourse.minCatalogNumber, pseudoCourse.maxCatalogNumber, 
                    null, null, id, pseudoCourse.topic, pseudoCourse.term,
                    pseudoCourse.component, pseudoCourse.faculty])
    }
}

export async function insertTerms (fastify: FastifyInstance, term: Term) { 
    await fastify.pg.query(`INSERT INTO terms(code, name) 
    VALUES($1, $2) 
    ON CONFLICT (code) DO UPDATE  
    SET name = $2 
    WHERE terms.code = $1`, 
    [term.code, term.name])
}

export async function getTerms(fastify: FastifyInstance): Promise<Term[]> {
    const gotTerms = await fastify.pg.query<Term>('SELECT name, code FROM terms')
    return gotTerms.rows
}

export async function createTermTable(fastify: FastifyInstance, term: string) {
    const query = `CREATE TABLE IF NOT EXISTS ${term} (id SERIAL PRIMARY KEY, courseid VARCHAR(8) UNIQUE);`
    await fastify.pg.query(query)
}

export async function insertTermCourses(fastify: FastifyInstance, term: string, id: string) {
    const query = `INSERT INTO ${term} (courseid) 
    VALUES($1) 
    ON CONFLICT (courseid) 
    DO NOTHING`
    await fastify.pg.query(query,
    [id])
}

export async function insertDegrees(fastify: FastifyInstance, degree: Degree) {
    const result = await fastify.pg.query(`INSERT INTO degrees 
        VALUES(DEFAULT, $1) 
        ON CONFLICT (name) DO NOTHING
        RETURNING id`, 
        [degree.name])
}

export async function insertPrograms(fastify: FastifyInstance, program: Program) {
    const result = await fastify.pg.query(`INSERT INTO programs 
        VALUES(DEFAULT, $1, $2, $3) 
        ON CONFLICT (url_code) DO NOTHING
        RETURNING id`, 
        [program.name, program.programSubtype, program.urlCode])
}

export async function searchPrograms(fastify: FastifyInstance, program: string): Promise<number[]> {
    const temp = await fastify.pg.query(`SELECT id FROM programs
        WHERE program_subtype = 'Major'
        AND name LIKE $1`, ['%' + program + '%'])
    if (temp.rows.length !== 0) {
        return temp.rows
    }
    else {
        const result = await fastify.pg.query(`SELECT id FROM programs
            WHERE name LIKE $1`, ['%' + program + '%'])
        return result.rows
    }
}