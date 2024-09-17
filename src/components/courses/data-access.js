"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProgram = exports.fetchPrograms = exports.fetchCourseByTerm = exports.fetchCourse = exports.getCourses = void 0;
async function getCourses(fastify) {
    const gotList = await fastify.pg.query('SELECT * FROM courses');
    return gotList.rows;
}
exports.getCourses = getCourses;
async function fetchCourse(fastify, courseid) {
    const gotCourse = await fastify.pg.query('SELECT * FROM courses WHERE courseid = $1', [courseid]);
    return gotCourse.rows;
}
exports.fetchCourse = fetchCourse;
async function fetchCourseByTerm(fastify, term) {
    const query = `SELECT courseid FROM ${term}`;
    const gotCourseList = await fastify.pg.query(query);
    return gotCourseList.rows;
}
exports.fetchCourseByTerm = fetchCourseByTerm;
async function fetchPrograms(fastify) {
    const gotList = await fastify.pg.query('SELECT * FROM programs');
    return gotList.rows;
}
exports.fetchPrograms = fetchPrograms;
async function fetchProgram(fastify, id) {
    const gotProgram = await fastify.pg.query('SELECT * FROM programs WHERE id = $1', [id]);
    return gotProgram.rows[0];
}
exports.fetchProgram = fetchProgram;
