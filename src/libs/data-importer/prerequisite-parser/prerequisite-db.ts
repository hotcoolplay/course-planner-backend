import { FastifyInstance } from "fastify";

export type PseudoCourseParents =
    | "Prerequisite"
    | "Requirement"
    | "Course List";

export async function insertPrerequisites(
    fastify: FastifyInstance,
    prereq: Prerequisite,
) {
    const result = await fastify.pg.query(
        `INSERT INTO prerequisites
        VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
            prereq.parentId,
            prereq.requisiteType,
            prereq.courseId,
            prereq.requisiteSubtype,
            prereq.amount,
            prereq.grade,
        ],
    );
    return result.rows[0].id;
}

export async function insertCoursePrerequisites(
    fastify: FastifyInstance,
    prereq: CoursePrerequisite,
) {
    await fastify.pg.transact(async (client) => {
        const id = await client.query(
            `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [
                prereq.parentId,
                prereq.requisiteType,
                prereq.courseId,
                prereq.requisiteSubtype,
                prereq.amount,
                prereq.grade,
            ],
        );
        await client.query(
            `INSERT INTO course_prerequisites
            VALUES($1, $2)`,
            [id, prereq.units],
        );
        if (prereq.pseudoCourses) {
            for (let i = 0; i < prereq.pseudoCourses.length; ++i) {
                fastify.pg.query(
                    `INSERT INTO pseudo_courses
                    VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id`,
                    [
                        prereq.pseudoCourses[i].subject,
                        prereq.pseudoCourses[i].catalogNumber,
                        prereq.pseudoCourses[i].minCatalogNumber,
                        prereq.pseudoCourses[i].maxCatalogNumber,
                        id,
                        null,
                        null,
                        prereq.pseudoCourses[i].topic,
                        prereq.pseudoCourses[i].term,
                        prereq.pseudoCourses[i].component,
                        prereq.pseudoCourses[i].faculty,
                    ],
                );
            }
        }
    });
}

export async function insertProgramPrerequisites(
    fastify: FastifyInstance,
    prereq: ProgramPrerequisite,
) {
    await fastify.pg.transact(async (client) => {
        const id = await client.query(
            `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [
                prereq.parentId,
                prereq.requisiteType,
                prereq.courseId,
                prereq.requisiteSubtype,
                prereq.amount,
                prereq.grade,
            ],
        );
        await client.query(
            `INSERT INTO program_prerequisites
            VALUES($1, $2, $3)`,
            [id, prereq.averageType, prereq.average],
        );
    });
}

export async function insertLevelPrerequisites(
    fastify: FastifyInstance,
    prereq: LevelPrerequisite,
) {
    await fastify.pg.transact(async (client) => {
        const id = await client.query(
            `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [
                prereq.parentId,
                prereq.requisiteType,
                prereq.courseId,
                prereq.requisiteSubtype,
                prereq.amount,
                prereq.grade,
            ],
        );
        await client.query(
            `INSERT INTO level_prerequisites
            VALUES($1, $2)`,
            [id, prereq.level],
        );
    });
}

export async function insertOtherPrerequisites(
    fastify: FastifyInstance,
    prereq: OtherPrerequisite,
) {
    await fastify.pg.transact(async (client) => {
        const id = await client.query(
            `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [
                prereq.parentId,
                prereq.requisiteType,
                prereq.courseId,
                prereq.requisiteSubtype,
                prereq.amount,
                prereq.grade,
            ],
        );
        await client.query(
            `INSERT INTO other_prerequisites
            VALUES($1, $2)`,
            [id, prereq.other],
        );
    });
}

export async function insertPrerequisiteCourses(
    fastify: FastifyInstance,
    prerequisiteId: number,
    subject: string,
    catalogNumber: string,
) {
    await fastify.pg.transact(async (client) => {
        const courseId = await client.query(
            `SELECT id FROM courses
            WHERE courses.subject = $1
            AND courses.catalognumber = $2`,
            [subject, catalogNumber],
        );
        await client.query(
            `INSERT INTO prerequisite_courses
            VALUES($1, $2)`,
            [prerequisiteId, courseId],
        );
    });
}

export async function insertPseudoCourses(
    fastify: FastifyInstance,
    id: number,
    pseudoCourse: PseudoCourse,
    parent: PseudoCourseParents,
) {
    if (parent === "Prerequisite") {
        await fastify.pg.query(
            `INSERT INTO pseudo_courses
                VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`,
            [
                pseudoCourse.subject,
                pseudoCourse.catalogNumber,
                pseudoCourse.minCatalogNumber,
                pseudoCourse.maxCatalogNumber,
                id,
                null,
                null,
                pseudoCourse.topic,
                pseudoCourse.term,
                pseudoCourse.component,
                pseudoCourse.faculty,
            ],
        );
    } else if (parent === "Requirement") {
        await fastify.pg.query(
            `INSERT INTO pseudo_courses
                VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`,
            [
                pseudoCourse.subject,
                pseudoCourse.catalogNumber,
                pseudoCourse.minCatalogNumber,
                pseudoCourse.maxCatalogNumber,
                null,
                id,
                null,
                pseudoCourse.topic,
                pseudoCourse.term,
                pseudoCourse.component,
                pseudoCourse.faculty,
            ],
        );
    } else {
        await fastify.pg.query(
            `INSERT INTO pseudo_courses
                VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`,
            [
                pseudoCourse.subject,
                pseudoCourse.catalogNumber,
                pseudoCourse.minCatalogNumber,
                pseudoCourse.maxCatalogNumber,
                null,
                null,
                id,
                pseudoCourse.topic,
                pseudoCourse.term,
                pseudoCourse.component,
                pseudoCourse.faculty,
            ],
        );
    }
}

export async function searchPrograms(
    fastify: FastifyInstance,
    program: string,
): Promise<number[]> {
    const temp = await fastify.pg.query(
        `SELECT id FROM programs
        WHERE program_subtype = 'Major'
        AND name LIKE $1`,
        ["%" + program + "%"],
    );
    if (temp.rows.length !== 0) {
        return temp.rows;
    } else {
        const result = await fastify.pg.query(
            `SELECT id FROM programs
            WHERE name LIKE $1`,
            ["%" + program + "%"],
        );
        return result.rows;
    }
}
