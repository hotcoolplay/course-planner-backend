import * as db from "./data-access.js";
export async function getCourseList(fastify) {
    const response = await db.getCourses(fastify);
    return response;
}
export async function getCourse(fastify, courseid) {
    const response = await db.fetchCourse(fastify, courseid);
    return response;
}
export async function getCoursesByTerm(fastify, term) {
    const termTable = term.replace("-", "_");
    const courseList = await db.fetchCourseByTerm(fastify, termTable);
    const response = [];
    for (let i = 0; i < courseList.length; ++i) {
        const course = await db.fetchCourse(fastify, courseList[i].courseid);
        if (course != undefined) {
            for (let j = 0; j < course.length; ++j) {
                response.push(course[j]);
            }
        }
    }
    return response;
}
