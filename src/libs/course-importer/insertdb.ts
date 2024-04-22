import { Response } from './parser'

export async function insertCourses (fastify: any, course: Response) { 
    await fastify.pg.query('INSERT INTO courses(subject, catalognumber, courseid) VALUES($1, $2, $3) ON CONFLICT (courseid) DO NOTHING', 
    [course.subjectCode, course.catalogNumber, course.courseId],
    function (err: any, result: any) {
        if (err) {
            console.error(err)
            return 0;
        }
    })
    return 1;
}

