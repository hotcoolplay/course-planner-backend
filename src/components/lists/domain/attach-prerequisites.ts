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
        retrievedPrerequisite,
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
      return await db.joinPrerequisite<ParentPrerequisite>(fastify, type, id);
    case "other":
      return await db.joinPrerequisite<OtherPrerequisite>(fastify, type, id);
    case "course":
      return await db.joinPrerequisite<CoursePrerequisite>(fastify, type, id);
    case "program":
      return await db.joinPrerequisite<ProgramPrerequisite>(fastify, type, id);
    case "degree":
      return await db.joinPrerequisite<DegreePrerequisite>(fastify, type, id);
    case "level":
      return await db.joinPrerequisite<LevelPrerequisite>(fastify, type, id);
    case "pseudoCourse":
      return await db.joinPrerequisite<PseudoCoursePrerequisite>(
        fastify,
        type,
        id,
      );
    case "pseudoProgram":
      return await db.joinPrerequisite<PseudoProgramPrerequisite>(
        fastify,
        type,
        id,
      );
    case "cumulativeAverage":
      return await db.joinPrerequisite<CumulativeAveragePrerequisite>(
        fastify,
        type,
        id,
      );
    case "majorAverage":
      return await db.joinPrerequisite<MajorAveragePrerequisite>(
        fastify,
        type,
        id,
      );
  }
}
