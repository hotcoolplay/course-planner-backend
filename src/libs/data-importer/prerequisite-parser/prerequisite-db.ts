import { FastifyInstance } from "fastify";

export async function insertParentPrerequisites(
  fastify: FastifyInstance,
  prereq: ParentPrerequisite,
): Promise<number> {
  return await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO course_prerequisites
            VALUES($1, $2, $3, $4, $5)
            `,
      [id, prereq.amount, prereq.grade, prereq.units, prereq.programAverage],
    );
    return id;
  });
}

export async function insertCoursePrerequisites(
  fastify: FastifyInstance,
  prereq: CoursePrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO course_prerequisites
            VALUES($1, $2)`,
      [id, prereq.courseId],
    );
  });
}

export async function insertProgramPrerequisites(
  fastify: FastifyInstance,
  prereq: ProgramPrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO program_prerequisites
            VALUES($1, $2)`,
      [id, prereq.programId],
    );
  });
}

export async function insertLevelPrerequisites(
  fastify: FastifyInstance,
  prereq: LevelPrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO level_prerequisites
            VALUES($1, $2)`,
      [id, prereq.level],
    );
  });
}

export async function insertPseudoCoursePrerequisites(
  fastify: FastifyInstance,
  prereq: PseudoCoursePrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO pseudo_course_prerequisites
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        prereq.subject,
        prereq.catalogNumber,
        prereq.minCatalogNumber,
        prereq.maxCatalogNumber,
        prereq.topic,
        prereq.term,
        prereq.component,
      ],
    );
  });
}

export async function insertCumulativeAveragePrerequisites(
  fastify: FastifyInstance,
  prereq: CumulativeAveragePrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO cumulative_average_prerequisites
            VALUES($1, $2)`,
      [id, prereq.cumulativeAverage],
    );
  });
}

export async function insertMajorAveragePrerequisites(
  fastify: FastifyInstance,
  prereq: MajorAveragePrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO major_average_prerequisites
            VALUES($1, $2)`,
      [id, prereq.majorAverage],
    );
  });
}

export async function insertPseudoProgramPrerequisites(
  fastify: FastifyInstance,
  prereq: PseudoProgramPrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO pseudo_program_prerequisites
            VALUES($1, $2, $3, $4)`,
      [id, prereq.faculty, prereq.majorType, prereq.majorSystem],
    );
  });
}

export async function insertDegreePrerequisites(
  fastify: FastifyInstance,
  prereq: DegreePrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO degree_prerequisites
            VALUES($1, $2)`,
      [id, prereq.degreeId],
    );
  });
}

export async function insertOtherPrerequisites(
  fastify: FastifyInstance,
  prereq: OtherPrerequisite,
) {
  await fastify.pg.transact(async (client) => {
    const result = await client.query(
      `INSERT INTO prerequisites
            VALUES(DEFAULT, $1, $2, $3, $4)
            RETURNING id`,
      [
        prereq.parentPrerequisiteId,
        prereq.requisiteType,
        prereq.parentCourseId,
        prereq.requisiteSubtype,
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `INSERT INTO other_prerequisites
            VALUES($1, $2)`,
      [id, prereq.other],
    );
  });
}

export async function searchCourses(
  fastify: FastifyInstance,
  subject: string,
  catalogNumber: string,
): Promise<number> {
  try {
    const result = await fastify.pg.query(
      `SELECT id FROM courses
          WHERE subject = $1
          AND catalog_number = $2`,
      [subject, catalogNumber],
    );
    return result.rows[0].id;
  } catch (err) {
    console.error(err);
    throw new Error(`Couldn't find ${subject + catalogNumber}!`);
  }
}

export async function searchPrograms(
  fastify: FastifyInstance,
  programName: string,
): Promise<number[]> {
  try {
    const majors = await fastify.pg.query(
      `SELECT id FROM programs
          WHERE program_subtype = 'Major'
          AND name LIKE $1`,
      [programName + "%(%"],
    );
    if (majors.rows.length !== 0) {
      return majors.rows;
    } else {
      const result = await fastify.pg.query(
        `SELECT id FROM programs
              WHERE name LIKE $1`,
        ["%" + programName + "%"],
      );
      return result.rows;
    }
  } catch (err) {
    console.error(err);
    throw new Error(`Couldn't find ${programName}!`);
  }
}

export async function searchDegrees(
  fastify: FastifyInstance,
  degreeName: string,
): Promise<number> {
  try {
    const result = await fastify.pg.query(
      `SELECT id FROM degrees
          WHERE name = $1`,
      [degreeName],
    );
    return result.rows[0].id;
  } catch (err) {
    console.error(err);
    throw new Error(`Couldn't find ${degreeName}!`);
  }
}

export async function searchFaculties(
  fastify: FastifyInstance,
  facultyName: string,
): Promise<string> {
  try {
    const result = await fastify.pg.query(
      `SELECT code FROM faculties
          WHERE faculty LIKE $1`,
      ["%" + facultyName + "%"],
    );
    return result.rows[0].code;
  } catch (err) {
    console.error(err);
    throw new Error(`Couldn't find ${facultyName}!`);
  }
}

export async function alterPHYS242Prerequisite(
  fastify: FastifyInstance,
  parentId: number,
) {
  try {
    await fastify.pg.transact(async (client) => {
      const result = await client.query(
        `SELECT id FROM prerequisites
        WHERE parent_id = $1`,
        [parentId],
      );
      const id = result.rows[0].id;
      await client.query(
        `UPDATE prerequisites
        SET requisite_type = 'coreq'
        WHERE parent_id = $1`,
        [id],
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error(`Couldn't alter PHYS242!`);
  }
}
