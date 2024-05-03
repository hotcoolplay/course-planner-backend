import { Course, Term } from '../../index'
import { FastifyInstance } from 'fastify'

export async function insertCourses (fastify: FastifyInstance, course: Course) { 
    await fastify.pg.query('INSERT INTO courses(subject, catalognumber, courseid) VALUES($1, $2, $3) ON CONFLICT (courseid) DO NOTHING', 
    [course.subjectcode, course.catalognumber, course.courseid])
}

export async function insertTerms (fastify: FastifyInstance, term: Term) { 
    await fastify.pg.query('INSERT INTO terms(code, name) VALUES($1, $2) ON CONFLICT (code) DO NOTHING', 
    [term.code, term.name])
}

export async function getTerms(fastify: FastifyInstance): Promise<Term[]> {
    const gotTerms = await fastify.pg.query<Term>('SELECT name, code FROM terms')
    return gotTerms.rows
}

export async function createTermTable(fastify: FastifyInstance, term: string) {
    const query = `CREATE TABLE IF NOT EXISTS ${term} (id SERIAL PRIMARY KEY, courseid VARCHAR(8) UNIQUE);`
    await fastify.pg.query(query)
}

export async function insertTermCourses(fastify: FastifyInstance, term: string, id: string) {
    const query = `INSERT INTO ${term} (courseid) VALUES($1) ON CONFLICT (courseid) DO NOTHING`
    await fastify.pg.query(query,
    [id])
}
