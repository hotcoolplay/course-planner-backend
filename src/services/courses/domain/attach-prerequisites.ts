import * as db from "../data-access/course-db.js";
import { FastifyWithTypeProvider } from "../../index.js";

import {
  CourseDTO,
  PrerequisiteDTO,
  ParentPrerequisiteDTO,
  RequisiteSubtype,
  OtherPrerequisiteDTO,
  LevelPrerequisiteDTO,
  CoursePrerequisiteDTO,
  ProgramPrerequisiteDTO,
  DegreePrerequisiteDTO,
  PseudoCoursePrerequisiteDTO,
  PseudoProgramPrerequisiteDTO,
  CumulativeAveragePrerequisiteDTO,
  MajorAveragePrerequisiteDTO,
} from "./course-schema.js";

export async function attachPrerequisiteToCourse(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<CourseWithPrerequisites> {
  let prerequisiteStructure: PrerequisiteDTO[] = [];
  const retrievedPrerequisites = await db.getPrerequisites(fastify, id);
  for (const retrievedPrerequisite of retrievedPrerequisites) {
    const joinedPrerequisite = await retrieveJoinedPrerequisites(
      fastify,
      retrievedPrerequisite.requisiteSubtype,
      retrievedPrerequisite.id,
    );
    if (joinedPrerequisite.parentCourseId) {
      if ("amount" in joinedPrerequisite) {
        const retrievedParentPrerequisite: ParentPrerequisiteDTO = {
          ...joinedPrerequisite,
          prerequisites: [],
        };
        prerequisiteStructure.push(retrievedParentPrerequisite);
      } else prerequisiteStructure.push(joinedPrerequisite);
    } else {
      prerequisiteStructure = insertPrerequisiteIntoTree(
        prerequisiteStructure,
        joinedPrerequisite,
      );
    }
  }
  const retrievedCourse = await db.fetchCourseById(fastify, id);
  const courseWithPrerequisites: CourseDTO & {
    prerequisites: PrerequisiteDTO[];
  } = {
    ...retrievedCourse,
    prerequisites: prerequisiteStructure,
  };
  return courseWithPrerequisites;
}

function insertPrerequisiteIntoTree(
  prerequisites: PrerequisiteDTO[],
  prerequisite: PrerequisiteDTO,
): PrerequisiteDTO[] {
  for (const retrievedPrerequisite of prerequisites) {
    if (
      "prerequisites" in retrievedPrerequisite &&
      Array.isArray(retrievedPrerequisite.prerequisites)
    ) {
      if (prerequisite.parentPrerequisiteId === retrievedPrerequisite.id) {
        retrievedPrerequisite.prerequisites.push({
          ...prerequisite,
          prerequisites: [],
        });
        return prerequisites;
      }
      retrievedPrerequisite.prerequisites = insertPrerequisiteIntoTree(
        retrievedPrerequisite.prerequisites,
        prerequisite,
      );
    }
  }
  return prerequisites;
}

async function retrieveJoinedPrerequisites(
  fastify: FastifyWithTypeProvider,
  type: RequisiteSubtype,
  id: number,
): Promise<PrerequisiteUnion> {
  switch (type) {
    case "parent":
      return await db.joinParentPrerequisite(fastify, id);
    case "other":
      return await db.joinOtherPrerequisite(fastify, id);
    case "course":
      return await db.joinCoursePrerequisite(fastify, id);
    case "program":
      return await db.joinProgramPrerequisite(fastify, id);
    case "degree":
      return await db.joinDegreePrerequisite(fastify, id);
    case "level":
      return await db.joinLevelPrerequisite(fastify, id);
    case "pseudoCourse":
      return await db.joinPseudoCoursePrerequisite(fastify, id);
    case "pseudoProgram":
      return await db.joinPseudoProgramPrerequisite(fastify, id);
    case "cumulativeAverage":
      return await db.joinCumulativeAveragePrerequisite(fastify, id);
    case "majorAverage":
      return await db.joinMajorAveragePrerequisite(fastify, id);
  }
}

export type CourseWithPrerequisites = CourseDTO & {
  prerequisites: PrerequisiteDTO[];
};

export type PrerequisiteUnion =
  | ParentPrerequisiteDTO
  | OtherPrerequisiteDTO
  | CoursePrerequisiteDTO
  | ProgramPrerequisiteDTO
  | DegreePrerequisiteDTO
  | LevelPrerequisiteDTO
  | PseudoCoursePrerequisiteDTO
  | PseudoProgramPrerequisiteDTO
  | CumulativeAveragePrerequisiteDTO
  | MajorAveragePrerequisiteDTO;
