"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCourses = void 0;
async function insertCourses(fastify, course) {
    await fastify.pg.query('INSERT INTO courses(subject, catalognumber, courseid) VALUES($1, $2, $3) ON CONFLICT (courseid) DO NOTHING', [course.subjectCode, course.catalogNumber, course.courseId], function (err, result) {
        if (err) {
            console.error(err);
            return 0;
        }
    });
    return 1;
}
exports.insertCourses = insertCourses;
