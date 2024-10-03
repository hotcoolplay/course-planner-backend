export async function getCourses(fastify) {
    const gotList = await fastify.pg.query("SELECT * FROM courses");
    return gotList.rows;
}
export async function fetchCourse(fastify, courseid) {
    const gotCourse = await fastify.pg.query(`SELECT * FROM courses 
        WHERE courseid = $1`, [courseid]);
    return gotCourse.rows;
}
export async function fetchCourseByTerm(fastify, term) {
    const query = `SELECT courseid FROM ${term}`;
    const gotCourseList = await fastify.pg.query(query);
    return gotCourseList.rows;
}
export async function fetchPrograms(fastify) {
    const gotList = await fastify.pg.query("SELECT * FROM programs");
    return gotList.rows;
}
export async function fetchProgram(fastify, id) {
    const gotProgram = await fastify.pg.query("SELECT * FROM programs WHERE id = $1", [id]);
    return gotProgram.rows[0];
    return gotProgram.rows[0];
}
