import * as db from "../data-access/course-db.js";
import { attachPrerequisiteToCourse } from "./attach-prerequisites.js";
import { FastifyWithTypeProvider } from "../../index.js";
import { CourseDTO } from "./course-schema.js";

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

export async function getSelectedCourse(
  fastify: FastifyWithTypeProvider,
  id: number,
) {
  const response = await attachPrerequisiteToCourse(fastify, id);
  return response;
}

export async function getCoursesByTerm(
  fastify: FastifyWithTypeProvider,
  term: string,
) {
  //validate term string
  if (!/^(?:fall|winter|spring)-[0-9]{4}$/g.exec(term)) {
    throw new Error("Invalid term to fetch courses with!");
  }
  const termTable = term.replace("-", "_");
  const courseList = await db.fetchCourseByTerm(fastify, termTable);
  const response: CourseDTO[] = [];
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
