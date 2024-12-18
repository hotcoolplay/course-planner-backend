import * as db from "../data-access/data-access.js";
import { attachPrerequisiteToCourse } from "./attach-prerequisites.js";
import { FastifyWithTypeProvider, SelectedMajor } from "../../index.js";
import { standardSequence } from "./standard-sequence.js";

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

export async function getMajors(fastify: FastifyWithTypeProvider) {
  const majorList = await db.fetchMajors(fastify);
  return majorList;
}

export async function getSelectedMajor(
  fastify: FastifyWithTypeProvider,
  id: number,
) {
  const major = await db.fetchMajorById(fastify, id);
  const sequences = await db.fetchMajorSequences(
    fastify,
    major.id,
    major.degreeId,
  );

  // Add the standard sequence if non-co-op is an option
  if (major.regular) sequences.push(standardSequence);

  const extensions = await db.fetchMajorExtensions(
    fastify,
    major.id,
    major.degreeId,
  );

  const selectedDegree = await db.fetchSelectedDegree(fastify, major.degreeId);

  const response: SelectedMajor = {
    ...major,
    degree: selectedDegree,
    sequences: sequences,
    extensions: extensions,
  };
  return response;
}

export async function getSelectedProgram(
  fastify: FastifyWithTypeProvider,
  id: number,
) {
  const program = await db.fetchProgramById(fastify, id);
  return program;
}
