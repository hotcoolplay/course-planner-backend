import { FastifyWithTypeProvider } from "../../index.js";
import {
  UserPlan,
  UserPlanDTO,
  PlanTerm,
  PlanList,
} from "../domain/plan-schema.js";

export async function getPlans(
  fastify: FastifyWithTypeProvider,
  userId: number,
): Promise<PlanList> {
  const gotList = await fastify.pg.query<PlanList[0]>(
    `SELECT id, name
        FROM user_plans
        WHERE user_id = $1`,
    [userId],
  );
  return gotList.rows;
}

export async function getPlanTerms(
  fastify: FastifyWithTypeProvider,
  planId: number,
) {
  const gotList = await fastify.pg.query<PlanTermWithoutCourses>(
    `SELECT id, user_plan_id AS "planId", term_type AS "termType", term_year AS "termYear" 
        FROM user_plan_terms
        WHERE user_plan_id = $1`,
    [planId],
  );
  return gotList.rows;
}

export async function getPlanMajors(
  fastify: FastifyWithTypeProvider,
  planId: number,
) {
  const gotList = await fastify.pg.query<{ majorId: number }>(
    `SELECT major_id AS "majorId"
        FROM user_plan_majors
        WHERE user_plan_id = $1`,
    [planId],
  );
  return gotList.rows;
}

export async function getPlanExtensions(
  fastify: FastifyWithTypeProvider,
  planId: number,
) {
  const gotList = await fastify.pg.query<{ extensionId: number }>(
    `SELECT extension_id AS "extensionId"
        FROM user_plan_extensions
        WHERE user_plan_id = $1`,
    [planId],
  );
  return gotList.rows;
}

export async function getTermCourses(
  fastify: FastifyWithTypeProvider,
  planTermId: number,
): Promise<{ courseId: number }[]> {
  const gotList = await fastify.pg.query<{ courseId: number }>(
    `SELECT uptc.course_id AS "courseId"
    FROM user_plan_term_courses AS uptc
    WHERE uptc.user_plan_term_id = $1`,
    [planTermId],
  );
  return gotList.rows;
}

export async function getPlan(
  fastify: FastifyWithTypeProvider,
  planId: number,
): Promise<NakedUserPlan> {
  const gotList = await fastify.pg.query<NakedUserPlan>(
    `SELECT id, user_id AS "userId", name
        FROM user_plans
        WHERE id = $1`,
    [planId],
  );
  return gotList.rows[0];
}

export async function addNewPlan(
  fastify: FastifyWithTypeProvider,
  plan: UserPlanDTO & { userId: number },
): Promise<number> {
  return fastify.pg.transact<number>(async (client) => {
    const result = await client.query<{ id: number }>(
      `INSERT INTO user_plans(user_id, name)
            VALUES($1, $2)
            RETURNING id`,
      [plan.userId, plan.name],
    );
    const planId = result.rows[0].id;
    for (const majorId of plan.majors) {
      client.query(
        `INSERT INTO user_plan_majors(user_plan_id, major_id)
            VALUES($1, $2)`,
        [planId, majorId],
      );
    }
    for (const extensionId of plan.extensions) {
      client.query(
        `INSERT INTO user_plan_extensionss(user_plan_id, extension_id)
            VALUES($1, $2)`,
        [planId, extensionId],
      );
    }
    for (const planTerm of plan.planTerms) {
      const termResult = await client.query<{ id: number }>(
        `INSERT INTO user_plan_terms(user_plan_id, term_type, term_year)
            VALUES($1, $2, $3)
            RETURNING id`,
        [planId, planTerm.termType, planTerm.termYear],
      );
      const termId = termResult.rows[0].id;
      for (const courseId of planTerm.termCourses) {
        client.query(
          `INSERT INTO user_plan_term_courses(user_plan_term_id, course_id)
            VALUES($1, $2)`,
          [termId, courseId],
        );
      }
    }
    return planId;
  });
}

export async function deletePlan(
  fastify: FastifyWithTypeProvider,
  planId: number,
  termIds: number[],
): Promise<number> {
  return fastify.pg.transact<number>(async (client) => {
    for (const termId of termIds) {
      await client.query(
        `DELETE FROM user_plan_term_courses
        WHERE user_plan_term_id = $1`,
        [termId],
      );
    }
    await client.query(
      `DELETE FROM user_plan_terms
      WHERE user_plan_id = $1`,
      [planId],
    );
    await client.query(
      `DELETE FROM user_plan_majors
            WHERE user_plan_id = $1`,
      [planId],
    );
    await client.query(
      `DELETE FROM user_plan_extensions
            WHERE user_plan_id= $1`,
      [planId],
    );
    const result = await client.query<{ id: number }>(
      `DELETE FROM user_plans
      WHERE id = $1
      RETURNING id`,
      [planId],
    );
    return result.rows[0].id;
  });
}

export async function updatePlan(
  fastify: FastifyWithTypeProvider,
  plan: UserPlan,
): Promise<number> {
  return fastify.pg.transact<number>(async (client) => {
    const result = await client.query<{ id: number }>(
      `UPDATE user_plans
            SET name = $1
            WHERE id = $2
            RETURNING id`,
      [plan.name, plan.id],
    );
    const planId = result.rows[0].id;
    client.query(
      `DELETE FROM user_plan_terms
      WHERE user_plan_id = $1`,
      [planId],
    );
    for (const planTerm of plan.planTerms) {
      const result = await client.query<{ id: number }>(
        `INSERT INTO user_plan_terms(plan_id, term_type, term_year) 
            VALUES($1, $2, $3)
            RETURNING id`,
        [planId, planTerm.termType, planTerm.termYear],
      );
      const termId = result.rows[0].id;
      client.query(
        `DELETE FROM user_plan_term_courses
            WHERE user_plan_term_id = $1`,
        [planTerm.id],
      );
      for (const courseId of planTerm.termCourses) {
        client.query(
          `INSERT INTO user_plan_term_courses(user_plan_term_id, course_id)
            VALUES($1, $2)`,
          [termId, courseId],
        );
      }
    }
    client.query(
      `DELETE FROM user_plan_majors
        WHERE user_plan_id = $1`,
      [plan.id],
    );
    for (const major of plan.majors) {
      client.query(
        `INSERT INTO user_plan_majors(user_plan_id, major_id)
        VALUES($1, $2)`,
        [planId, major.id],
      );
    }
    client.query(
      `DELETE FROM user_plan_extensions
        WHERE user_plan_id = $1`,
      [plan.id],
    );
    for (const extension of plan.extensions) {
      client.query(
        `INSERT INTO user_plan_extensions(user_plan_id, extension_id)
        VALUES($1, $2)`,
        [planId, extension.id],
      );
    }
    return planId;
  });
}

export async function getPlanUser(
  fastify: FastifyWithTypeProvider,
  planId: number,
): Promise<{ userId: number }> {
  const gotList = await fastify.pg.query<{ userId: number }>(
    `SELECT user_id AS "userId"
        FROM user_plans
        WHERE id = $1`,
    [planId],
  );
  return gotList.rows[0];
}

type NakedUserPlan = Omit<UserPlan, "planTerms" | "majors" | "extensions">;

type PlanTermWithoutCourses = Omit<PlanTerm, "termCourses">;
