"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestTermCourseList = exports.requestTerms = exports.requestCourses = void 0;
const db = __importStar(require("./insertdb"));
const axios_1 = __importDefault(require("axios"));
async function requestCourses(fastify) {
    console.log('Calling course API...');
    const options = {
        method: 'GET',
        url: 'https://openapi.data.uwaterloo.ca/v3/Courses/1241',
        headers: {
            'x-api-key': process.env.UW_API_KEY_V3
        }
    };
    await axios_1.default.request(options).then(async function ({ data }) {
        let updatedCourses = 0;
        for (let i = 0; i < data.length; ++i) {
            const course = { courseid: data[i].courseId,
                subjectcode: data[i].subjectCode,
                catalognumber: data[i].catalogNumber
                //requirementsDescription: data[i].requirementsDescription
            };
            await db.insertCourses(fastify, course);
            console.log(course.subjectcode + course.catalognumber);
        }
        return `${updatedCourses} out of ${data.length} successfully updated.`;
    }).catch(function (error) {
        console.error(error);
        return 'Couldn\'t fetch course data. Try again later?';
    });
}
exports.requestCourses = requestCourses;
async function requestTerms(fastify) {
    console.log('Calling term API...');
    const options = {
        method: 'GET',
        url: 'https://openapi.data.uwaterloo.ca/v3/Terms',
        headers: {
            'x-api-key': process.env.UW_API_KEY_V3
        }
    };
    await axios_1.default.request(options).then(async function ({ data }) {
        for (let i = 0; i < data.length; ++i) {
            const term = { code: data[i].termCode, name: data[i].name };
            await db.insertTerms(fastify, term);
            console.log(term.name + ': ' + term.code);
        }
    }).catch(function (error) {
        console.error(error);
        return 'Couldn\'t fetch term data. Try again later?';
    });
}
exports.requestTerms = requestTerms;
async function requestTermCourseList(fastify) {
    console.log('Calling class schedule API...');
    const terms = await db.getTerms(fastify);
    for (let i = 0; i < terms.length; ++i) {
        let options = {
            method: 'GET',
            url: 'https://openapi.data.uwaterloo.ca/v3/ClassSchedules/',
            headers: {
                'x-api-key': process.env.UW_API_KEY_V3
            }
        };
        const termName = (terms[i].name.charAt(0).toLowerCase() + terms[i].name.slice(1)).replace(' ', '_');
        await db.createTermTable(fastify, termName);
        options.url += terms[i].code;
        console.log(options.url);
        await axios_1.default.request(options).then(async function ({ data }) {
            for (let i = 0; i < data.length; ++i) {
                await db.insertTermCourses(fastify, termName, data[i]);
            }
        }).catch(function (error) {
            console.error(error);
            return 'Couldn\'t fetch class schedule data. Try again later?';
        });
    }
}
exports.requestTermCourseList = requestTermCourseList;
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
