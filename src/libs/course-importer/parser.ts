import * as db from './insertdb';
import axios from 'axios'
import { Course, Term } from '../../index'
import { FastifyInstance } from 'fastify'

interface CourseResponse {
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

interface TermResponse {
    termCode: string,
    name: string,
    nameShort: string,
    termBeginDate: string,
    termEndDate: string,
    sixtyPercentCompleteDate: string,
    associatedAcademicYear: number
}

export async function requestCourses(fastify: FastifyInstance) {
    console.log('Calling course API...')
    const options = {
        method: 'GET',
        url: 'https://openapi.data.uwaterloo.ca/v3/Courses/1241',
        headers: {
            'x-api-key': process.env.UW_API_KEY_V3
        }
    }
    await axios.request(options).then(async function ({data}: {data: CourseResponse[]}) {
        let updatedCourses = 0;
        for (let i = 0; i < data.length; ++i) {
            if (data[i].associatedAcademicCareer === 'UG') {
                const course: Course = { courseid: data[i].courseId, 
                    subjectcode: data[i].subjectCode,
                    catalognumber: data[i].catalogNumber
                    //requirementsDescription: data[i].requirementsDescription
                };
                await db.insertCourses(fastify, course)
                console.log(course.subjectcode + course.catalognumber)
            }
        }
        return `${updatedCourses} out of ${data.length} successfully updated.`
    }).catch(function (error: any) {
        console.error(error);
        return 'Couldn\'t fetch course data. Try again later?';
    });
}

export async function requestTerms(fastify: FastifyInstance) {
    console.log('Calling term API...')
    const options = {
        method: 'GET',
        url: 'https://openapi.data.uwaterloo.ca/v3/Terms',
        headers: {
            'x-api-key': process.env.UW_API_KEY_V3
        }
    }
    await axios.request(options).then(async function ({data}: {data: TermResponse[]}) {
        for (let i = 0; i < data.length; ++i) {
            const term: Term = { code: data[i].termCode, name: data[i].name };
            await db.insertTerms(fastify, term)
            console.log(term.name +  ': ' + term.code)
        }
    }).catch(function (error: any) {
        console.error(error);
        return 'Couldn\'t fetch term data. Try again later?';
    });
}

export async function requestTermCourseList(fastify: FastifyInstance) {
    console.log('Calling class schedule API...')
    const terms = await db.getTerms(fastify)
    for (let i = 0; i < terms.length; ++i) {
        let options = {
            method: 'GET',
            url: 'https://openapi.data.uwaterloo.ca/v3/ClassSchedules/',
            headers: {
                'x-api-key': process.env.UW_API_KEY_V3
            }
        }
        const termName = (terms[i].name.charAt(0).toLowerCase() + terms[i].name.slice(1)).replace(' ', '_')
        await db.createTermTable(fastify, termName)
        options.url += terms[i].code
        console.log(options.url)
        await axios.request(options).then(async function ({data}: {data: string[]}) {
            for (let i = 0; i < data.length; ++i) {
                await db.insertTermCourses(fastify, termName, data[i])
            }
        }).catch(function (error: any) {
            console.error(error);
            return 'Couldn\'t fetch class schedule data. Try again later?';
        });
    }
}
/* Potentially implement at a later time
function checkEligibility(reqs: string): boolean {
    const prereqs: string[] = reqs.includes('Prereq: ') ?
    reqs.split('Prereq:')[1].split('Coreq:')[0].split('Antireq:')[0].split(/[;.]/) : [''];
    for (let i = 0; i < prereqs.length; ++i) {
        const check: string = prereqs[i].toLowerCase();
        if (check.includes('not open to')) {
            if (check.includes('faculty of math') 
                || check.includes('honours mathematics') 
            || check.includes ('computer science')) {
                return false;
            }
        }
        if (check.includes('only')) {
            if (!check.includes('computer science') 
                    && !check.includes('mathematics ')
                        && !check.includes('math ')
                            && !check.includes('co-op')
                                && !check.includes('coop')
                                    && !check.includes('honours students')
                                        && check != ' honours') {
                                    return false;
                                }
        }
        if (convertLevel.some(e => check.includes(' ' + e + ' ')  
            && check != (' level at least ' + e) 
            && check != (' level at least ' + e + ' honours')
            && !check.includes(' level at least ' + e + ' or')
            && !check.includes('or ' + e))) {
            if (!check.includes('computer science') 
                && !check.includes('mathematics ')
                    && !check.includes('math ')
                        && !check.includes('honours students')) {
                        console.log(check);
                        return false;
                    }
        }
    }
    return true;
}

function checkHelper(check: string) {
    if (check.includes('not open to')) {
            if (check.includes('faculty of math') 
                || check.includes('honours mathematics') 
            || check.includes ('computer science')) {
                return false;
            }
        }
        if (check.includes('only')) {
            if (!check.includes('computer science') 
                    && !check.includes('mathematics ')
                        && !check.includes('math ')
                            && !check.includes('co-op')
                                && !check.includes('coop')
                                    && !check.includes('honours students')
                                        && check != ' honours') {
                                    return false;
                                }
        }
        if (convertLevel.some(e => check.includes(' ' + e + ' ')  
            && check != (' level at least ' + e) 
            && check != (' level at least ' + e + ' honours')
            && !check.includes(' level at least ' + e + ' or')
            && !check.includes('or ' + e))) {
            if (!check.includes('computer science') 
                && !check.includes('mathematics ')
                    && !check.includes('math ')
                        && !check.includes('honours students')) {
                        console.log(check);
                        return false;
                    }
        }
}*/
