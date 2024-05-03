import { FastifyWithTypeProvider, Term, Course } from '../../index'

export async function getCourses(fastify: FastifyWithTypeProvider) {
    const gotList = await fastify.pg.query<Course>('SELECT subject AS subjectcode, catalognumber, courseid FROM courses')
    return gotList.rows
}

export async function fetchCourse(fastify: FastifyWithTypeProvider, courseid: string) {
    const gotCourse = await fastify.pg.query<Course>('SELECT subject AS subjectcode, catalognumber, courseid FROM courses WHERE courseid = $1', [courseid])
    return gotCourse.rows[0]
}

export async function fetchCourseByTerm(fastify: FastifyWithTypeProvider, term: string): Promise<{ courseid: string}[]> {
    const query = `SELECT courseid FROM ${term}`
    const gotCourseList = await fastify.pg.query<{ courseid: string }>(query)
    return gotCourseList.rows
}
