import * as db from "../data-access/data-access.js";
import {
  FastifyWithTypeProvider,
  RetrievedParentPrerequisite,
  RetrievedEntity,
  CourseWithPrerequisites,
} from "../../index.js";

export async function attachPrerequisiteToCourse(
  fastify: FastifyWithTypeProvider,
  id: number,
) {
  let prerequisiteStructure: RetrievedEntity<Prerequisite>[] = [];
  const retrievedPrerequisites = await db.getPrerequisites(fastify, id);
  for (const retrievedPrerequisite of retrievedPrerequisites) {
    const joinedPrerequisite = await retrieveJoinedPrerequisites(
      fastify,
      retrievedPrerequisite.requisiteSubtype,
      retrievedPrerequisite.id,
    );
    if (joinedPrerequisite.parentCourseId) {
      if ("amount" in joinedPrerequisite) {
        const retrievedParentPrerequisite: RetrievedParentPrerequisite = {
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
  const courseWithPrerequisites: CourseWithPrerequisites = {
    ...retrievedCourse,
    prerequisites: prerequisiteStructure,
  };
  return courseWithPrerequisites;
}

function insertPrerequisiteIntoTree(
  prerequisites: RetrievedEntity<Prerequisite>[],
  prerequisite: RetrievedEntity<Prerequisite>,
) {
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
  type: requisiteSubtype,
  id: number,
) {
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
