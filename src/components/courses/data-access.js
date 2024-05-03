"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCourseByTerm = exports.fetchCourse = exports.getCourses = void 0;
async function getCourses(fastify) {
    const gotList = await fastify.pg.query('SELECT subject AS subjectcode, catalognumber, courseid FROM courses');
    return gotList.rows;
}
exports.getCourses = getCourses;
async function fetchCourse(fastify, courseid) {
    const gotCourse = await fastify.pg.query('SELECT subject AS subjectcode, catalognumber, courseid FROM courses WHERE courseid = $1', [courseid]);
    return gotCourse.rows[0];
}
exports.fetchCourse = fetchCourse;
async function fetchCourseByTerm(fastify, term) {
    const query = `SELECT courseid FROM ${term}`;
    const gotCourseList = await fastify.pg.query(query);
    return gotCourseList.rows;
}
exports.fetchCourseByTerm = fetchCourseByTerm;
