import { insertCourses } from './insertdb';
import axios from 'axios'
import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

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
const options = {
    method: 'GET',
    url: 'https://openapi.data.uwaterloo.ca/v3/courses/1239',
    headers: {
        'x-api-key': process.env.UW_API_KEY_V3
    }
}

async function parseCourses(fastify: FastifyInstance) {
    console.log('Calling API...')
    await axios.request(options).then(async function ({data}: {data: Response[]}) {
        const courses = data.length;
        let updatedCourses = 0;
        for (let i = 0; i < data.length; ++i) {
            const course = data[i];
            if (course.associatedAcademicCareer === 'UG') {
                console.log(course.subjectCode + course.catalogNumber)
                updatedCourses += await insertCourses(fastify, course)
            }
        }
        return `${updatedCourses} out of ${courses} successfully updated.`
    }).catch(function (error: any) {
        console.error(error);
        return 'Couldn\'t fetch course data. Try again later?';
    });
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
export default fp(parseCourses);
