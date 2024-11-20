import * as db from "../data-access/data-access.js";
import { attachPrerequisiteToCourse } from "./attach-prerequisites.js";
import {
  FastifyWithTypeProvider,
  CourseWithPrerequisites,
} from "../../index.js";

export async function getCourseList(fastify: FastifyWithTypeProvider) {
  const courseList = await db.getCourses(fastify);
  return courseList;
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
  for (const crossLists of courseList) {
    const courses = await db.fetchCourseByCourseId(
      fastify,
      crossLists.courseid,
    );
    if (courses != undefined) {
      for (const course of courses) {
        response.push(course);
      }
    }
  }
  return response;
}
