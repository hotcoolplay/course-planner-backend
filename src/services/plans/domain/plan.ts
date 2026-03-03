import * as db from "../data-access/plan-db.js";
import { FastifyWithTypeProvider } from "../../index.js";
import {
  SelectedMajorDTO,
  SelectedProgramDTO,
} from "../../programs/domain/program-schema.js";
import {
  getSelectedMajor,
  getSelectedProgram,
} from "../../programs/domain/retrieve-programs.js";
import { UserPlan, UserPlanDTO, PlanTerm, PlanList } from "./plan-schema";

export async function getPlanList(
  fastify: FastifyWithTypeProvider,
  userId: number,
): Promise<PlanList> {
  const planList = await db.getPlans(fastify, userId);
  return planList;
}

export async function getPlan(
  fastify: FastifyWithTypeProvider,
  planId: number,
): Promise<UserPlan> {
  const planWithoutTerms = await db.getPlan(fastify, planId);
  const planMajors = await db.getPlanMajors(fastify, planId);
  const planExtensions = await db.getPlanExtensions(fastify, planId);
  const planSelectedMajors: SelectedMajorDTO[] = [];
  for (const majorId of planMajors) {
    const selectedMajor = await getSelectedMajor(fastify, majorId.majorId);
    planSelectedMajors.push(selectedMajor);
  }
  const planSelectedExtensions: SelectedProgramDTO[] = [];
  for (const extensionId of planExtensions) {
    const selectedExtension = await getSelectedProgram(
      fastify,
      extensionId.extensionId,
    );
    planSelectedExtensions.push(selectedExtension);
  }
  const termsWithoutCourses = await db.getPlanTerms(fastify, planId);
  const terms: PlanTerm[] = [];
  for (const termWithoutCourses of termsWithoutCourses) {
    const courses = await db.getTermCourses(fastify, termWithoutCourses.id);
    terms.push({
      ...termWithoutCourses,
      termCourses: extractCourseIds(courses),
    });
  }
  return {
    ...planWithoutTerms,
    majors: planSelectedMajors,
    extensions: planSelectedExtensions,
    planTerms: terms,
  };
}

export async function createUserPlan(
  fastify: FastifyWithTypeProvider,
  plan: UserPlanDTO & { userId: number },
): Promise<number> {
  return await db.addNewPlan(fastify, plan);
}

export async function deletePlan(
  fastify: FastifyWithTypeProvider,
  planId: number,
): Promise<number> {
  const terms = await db.getPlanTerms(fastify, planId);
  const termIds = terms.map((term) => term.id);

  return await db.deletePlan(fastify, planId, termIds);
}

export async function updateUserPlan(
  fastify: FastifyWithTypeProvider,
  plan: UserPlan,
): Promise<number> {
  return await db.updatePlan(fastify, plan);
}

export async function checkPlanAuthorization(
  fastify: FastifyWithTypeProvider,
  planId: number,
  userId: number,
): Promise<boolean> {
  const planUserId = await db.getPlanUser(fastify, planId);
  return userId === planUserId.userId;
}

function extractCourseIds(courseIds: { courseId: number }[]): number[] {
  const arr: number[] = [];
  for (const courseId of courseIds) {
    arr.push(courseId.courseId);
  }
  return arr;
}
