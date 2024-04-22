import { getCourses, fetchCourse } from './data-access'
import { FastifyInstance } from 'fastify'

export async function getCourseList(fastify: FastifyInstance) {
    const response = await getCourses(fastify)
    return response
}

export async function getCourse(fastify: FastifyInstance, courseid: string) {
    const response = await fetchCourse(fastify, courseid)
    return response
}
