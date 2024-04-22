"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const insertdb_1 = require("./insertdb");
const axios_1 = __importDefault(require("axios"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const options = {
    method: 'GET',
    url: 'https://openapi.data.uwaterloo.ca/v3/courses/1239',
    headers: {
        'x-api-key': process.env.UW_API_KEY_V3
    }
};
async function parseCourses(fastify) {
    console.log('Calling API...');
    await axios_1.default.request(options).then(async function ({ data }) {
        const courses = data.length;
        let updatedCourses = 0;
        for (let i = 0; i < data.length; ++i) {
            const course = data[i];
            if (course.associatedAcademicCareer === 'UG') {
                console.log(course.subjectCode + course.catalogNumber);
                updatedCourses += await (0, insertdb_1.insertCourses)(fastify, course);
            }
        }
        return `${updatedCourses} out of ${courses} successfully updated.`;
    }).catch(function (error) {
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
exports.default = (0, fastify_plugin_1.default)(parseCourses);
