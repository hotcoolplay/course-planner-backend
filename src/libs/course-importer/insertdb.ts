import { FastifyInstance } from 'fastify'
import { Response } from './client'
import FastifyPlugin from 'fastify-plugin'

const fastify = require('fastify')()

export async function insertCourses (course: Response) { 
    await fastify.pg.query('INSERT INTO courses(subject, catalognumber, courseid) VALUES($1, $2, $3) ON CONFLICT (courseid) DO NOTHING', 
    [course.subjectCode, course.catalogNumber, course.courseId],
    function onResult (err: any, result: any) {
        if (err) {
            console.error(err)
            return 0;
        }
    })
    return 1;
}
