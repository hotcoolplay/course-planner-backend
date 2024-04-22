"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCourse = exports.getCourses = void 0;
async function getCourses(fastify) {
    const gotList = await fastify.pg.query('SELECT * FROM courses');
    return gotList;
}
exports.getCourses = getCourses;
async function fetchCourse(fastify, courseid) {
    const gotCourse = await fastify.pg.query('SELECT * FROM courses WHERE courseid = $1', [courseid]);
    return gotCourse;
}
exports.fetchCourse = fetchCourse;
