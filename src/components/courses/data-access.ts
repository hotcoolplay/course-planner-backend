const fastify = require('fastify')()

type course = {
    subject: string,
    code: string,
    id: string
}

export async function getCourses(): Promise<course[] | null> {
    const gotList = await fastify.pg.query('SELECT * FROM courses')
    return gotList
}

export async function fetchCourse(courseid: string): Promise<course | null> {
    const gotCourse = await fastify.pg.query('SELECT * FROM courses WHERE courseid = $1', [courseid])
    return gotCourse
}
