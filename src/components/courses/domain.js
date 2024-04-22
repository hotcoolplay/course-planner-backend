"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourse = exports.getCourseList = void 0;
const data_access_1 = require("./data-access");
async function getCourseList(fastify) {
    const response = await (0, data_access_1.getCourses)(fastify);
    return response;
}
exports.getCourseList = getCourseList;
async function getCourse(fastify, courseid) {
    const response = await (0, data_access_1.fetchCourse)(fastify, courseid);
    return response;
}
exports.getCourse = getCourse;
