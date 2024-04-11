import axios from 'axios'
import parseCourses from './parser'
import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from 'fastify'
import FastifyPlugin from 'fastify-plugin'

export interface Response {
    courseId: string,
    courseOfferNumber: number,
    termCode: string,
    termName: string, 
    associatedAcademicCareer: string,
    associatedAcademicGroupCode: string,
    associatedAcademicOrgCode: string,
    subjectCode: string,
    catalogNumber: string,
    title: string,
    descriptionAbbreviated: string,
    description: string,
    gradingBasis: string,
    courseComponentCode: string,
    enrollConsentCode: string,
    enrollConsentDescription: string,
    dropConsentCode: string,
    dropConsentDescription: string,
    requirementsDescription: string
}

const updateCourses: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post('/update-courses', async (request) => {
        console.log('Updating course database...')
        return await parseCourses()
    })
}

export default FastifyPlugin(updateCourses)
