"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTermCourses = exports.createTermTable = exports.getTerms = exports.insertTerms = exports.insertCourses = void 0;
async function insertCourses(fastify, course) {
    await fastify.pg.query('INSERT INTO courses(subject, catalognumber, courseid) VALUES($1, $2, $3) ON CONFLICT (courseid) DO NOTHING', [course.subjectcode, course.catalognumber, course.courseid]);
}
exports.insertCourses = insertCourses;
async function insertTerms(fastify, term) {
    await fastify.pg.query('INSERT INTO terms(code, name) VALUES($1, $2) ON CONFLICT (code) DO NOTHING', [term.code, term.name]);
}
exports.insertTerms = insertTerms;
async function getTerms(fastify) {
    const gotTerms = await fastify.pg.query('SELECT name, code FROM terms');
    return gotTerms.rows;
}
exports.getTerms = getTerms;
async function createTermTable(fastify, term) {
    const query = `CREATE TABLE IF NOT EXISTS ${term} (id SERIAL PRIMARY KEY, courseid VARCHAR(8) UNIQUE);`;
    await fastify.pg.query(query);
}
exports.createTermTable = createTermTable;
async function insertTermCourses(fastify, term, id) {
    const query = `INSERT INTO ${term} (courseid) VALUES($1) ON CONFLICT (courseid) DO NOTHING`;
    await fastify.pg.query(query, [id]);
}
exports.insertTermCourses = insertTermCourses;
