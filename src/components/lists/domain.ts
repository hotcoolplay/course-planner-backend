import * as db from "./data-access.js";
import { FastifyWithTypeProvider } from "./api.js";

export async function getCourseList(fastify: FastifyWithTypeProvider) {
  const response = await db.getCourses(fastify);
  return response;
}

export async function getCourse(
  fastify: FastifyWithTypeProvider,
  courseid: string,
) {
  const response = await db.fetchCourseByCourseId(fastify, courseid);
  return response;
}

export async function getCoursesByTerm(
  fastify: FastifyWithTypeProvider,
  term: string,
) {
  const termTable = term.replace("-", "_");
  const courseList = await db.fetchCourseByTerm(fastify, termTable);
  const response: Course[] = [];
  for (let i = 0; i < courseList.length; ++i) {
    const course = await db.fetchCourseByCourseId(
      fastify,
      courseList[i].courseid,
    );
    if (course != undefined) {
      for (let j = 0; j < course.length; ++j) {
        response.push(course[j]);
      }
    }
  }
  return response;
}
