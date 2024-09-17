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
Object.defineProperty(exports, "__esModule", { value: true });
const db = __importStar(require("../insertdb"));
const commaPrograms = ['Rhetoric, Media, & Communication', 'Environment, Resource & Sustainability',
    'Society, Technology & Values', 'Addictions, Mental Health, & Policy',
    'Sexuality, Marriage, & Family Studies'
];
async function parsePrerequisite(fastify, requirement, requisiteType, id, coreqId) {
    requirement = requirement.replace(/MSC(?:i|I)/g, 'MSCI');
    requirement = requirement.replace('BUS498KW', 'BUS498W');
    const prereq1 = /^([A-Z]{2,6}\s?[0-9]{1,3}[A-Z]?) - .+ \([0-9].[0-9]{2}\)$/g.exec(requirement);
    const prereq2 = /^(?:Must have c|C)omplete(?:|d)(| or concurrently enrolled in)(?:| at least)(| [1-9]| one| all)(?:| of)(?:| the following)(?:| course):?\s*((?:(?:(?:[A-Z]{2,6}\s*[0-9]{1,3}[A-Z]?(?:(?: or |\/)[A-Z]{0,6}\s*[0-9]{3}K?[A-Z]?)*))*\s*(?:|\(Topic [0-9]*:?[^)]*|\(?(?:taken|prior to)[^)]*)\)?,?\s*)+)$/g.exec(requirement);
    const prereq3 = /^\s*Not complete(?:|d)(?:| nor| or)(?:| concurrently| currently)(?:| enrolled)(?:| in)(?:| any of)(?:| the following):?\s*((?:(?:(?:[A-Z]{2,6}\s*[0-9]{1,3}[A-Z]?(?:(?: or |\/)[A-Z]{0,6}\s*[0-9]{3}K?[A-Z]?)*))*\s*(?:|\(Topic [0-9]*:?[^)]*|\(?(?:taken|prior to)[^)]*)\)?,?\s*)+)$/g.exec(requirement);
    const prereq4 = /^Students must be in level ([1-9][AB])(| or higher)$/g.exec(requirement);
    const prereq5 = /^Earned a minimum grade of ([0-9]{2})% in (each|at least [1-9]) of the following: $/g.exec(requirement);
    const prereq6 = /^Earned (?:|at least )([0-9.]{1,4}) units from((?: [A-Z]{2,6},?(?:| or))+)( [0-9]{3} - [0-9]{3}| [0-9]{3}-level studio courses)*$/g.exec(requirement);
    const prereq7 = /^(?:Must have e|E)arned a minimum \s*(?:|cumulative)\s*(|[A-Z]{2,6}|(?:[A-Z][a-z]+\s*)+)\s*(|major) average of ([0-9]{2})(?:|.0|.0%|.0%.)$/g.exec(requirement);
    const prereq8 = /^(?:See c|C)ore(?:|re)quisite(?:|s)(?:| \(see below\))$/g.exec(requirement);
    if (prereq1) {
        const subject = /^[A-Z]{2,6}/.exec(prereq1[1])[0];
        const catalog = /[0-9]{1,3}[A-Z]?$/.exec(prereq1[1])[0];
        await db.insertPrerequisiteCourses(fastify, id, subject, catalog);
        return [null, coreqId];
    }
    else if (prereq2) {
        if (prereq2[1] !== '')
            requisiteType = 'coreq';
        const amount = prereq2[2] === '' || prereq2[2].trim() === 'all' ? 0 :
            (prereq2[2] === ' one' ? 1 : Number(prereq2[2].trim()));
        const newId = await db.insertPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { amount: amount, requisiteType: requisiteType, parentId: id }));
        if (prereq2[3].trim() !== '') {
            const courses = prereq2[3].split(/(?<!\([^)]*),\s+(?!(?:|fall|winter|spring)\s*[0-9]{4})/g);
            parseCourses(fastify, courses, requisiteType, newId);
            return [null, coreqId];
        }
        else
            return [newId, coreqId];
    }
    else if (prereq3) {
        const newId = await db.insertPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { amount: 1, requisiteType: 'antireq', parentId: id }));
        if (prereq3[1].trim() !== '') {
            const courses = prereq3[1].split(/(?<!\([^)]*),\s+(?!(?:|fall|winter|spring)\s*[0-9]{4})/g);
            parseCourses(fastify, courses, 'antireq', newId);
            return [null, coreqId];
        }
        else
            return [newId, coreqId];
    }
    else if (prereq4) {
        const level = prereq4[1];
        db.insertLevelPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { level: prereq4[2] === '' ? level : level + '+', requisiteType: 'prereq', parentId: id }));
        return [null, coreqId];
    }
    else if (prereq5) {
        const grade = Number(/[0-9]{2}/.exec(prereq5[1]));
        const amt = prereq5[2] === 'each' ? 0 : Number(/[1-9]/.exec(prereq5[2]));
        await db.insertPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { amount: amt, grade: grade, requisiteType: 'prereq', parentId: id }));
        return [id, coreqId];
    }
    else if (prereq6) {
        const units = Number(prereq6[1]);
        const subjects = prereq6[2].replace(/\s/g, '').replace('or', '').split(',');
        let pseudoCourses = [];
        for (let i = 0; i < subjects.length; ++i) {
            pseudoCourses.push(Object.assign(Object.assign({}, nullPseudoCourse), { subject: subjects[i] }));
        }
        let tempId;
        let minCatalogNumber = null;
        let maxCatalogNumber = null;
        let component = null;
        if (/[0-9]{3} - [0-9]{3}/g.exec(prereq6[3])) {
            minCatalogNumber = Number(prereq6[3].split('-')[0].trim());
            maxCatalogNumber = Number(prereq6[3].split('-')[1].trim());
        }
        else if (/[0-9]{3}-level studio courses/g.exec(prereq6[3])) {
            const level = Number(/[0-9]{3}/g.exec(prereq6[3])[1]);
            minCatalogNumber = level;
            maxCatalogNumber = level + 99;
        }
        for (let i = 0; i < subjects.length; ++i) {
            pseudoCourses.push(Object.assign(Object.assign({}, nullPseudoCourse), { subject: subjects[i], minCatalogNumber: minCatalogNumber, maxCatalogNumber: maxCatalogNumber, component: component }));
        }
        db.insertCoursePrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { units: units, requisiteType: 'prereq', parentId: id, pseudoCourses: pseudoCourses }));
        return [null, coreqId];
    }
    else if (prereq7) {
        const average = Number(prereq7[3]);
        if (prereq7[1] === '') {
            let avg;
            if (prereq7[2] === '')
                avg = 'CAV';
            else
                avg = 'MAV';
            const averageType = avg;
            db.insertProgramPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { average: average, averageType: averageType, parentId: id, programs: null, faculties: null }));
            return [null, coreqId];
        }
        else {
            const averageType = 'MAV';
            let program;
            if (prereq7[1] === 'ANTH')
                program = 'Anthropology';
            else if (prereq7[1] === 'HRM')
                program = 'Human Resources Management';
            else
                program = prereq7[1];
            const programs = await db.searchPrograms(fastify, program);
            db.insertProgramPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { average: average, averageType: averageType, parentId: id, programs: programs, faculties: null }));
            return [null, coreqId];
        }
    }
    else if (prereq8) {
        return [null, id];
    }
    else {
        console.log(requirement);
        db.insertOtherPrerequisites(fastify, Object.assign(Object.assign({}, nullPrerequisite), { other: requirement, parentId: id }));
        return [null, id];
    }
}
async function parseCourses(fastify, courses, requisiteType, id) {
    for (let i = 0; i < courses.length; ++i) {
        if (/(?<=(?:\/| or )[A-Z]{0,6}\s*[0-9]{1,3}[A-Z]?)(?:| .*)$/g.exec(courses[i])) {
            const subcourses = courses[i].split(/(?<=(?:\/| or )[A-Z]{0,6}\s*[0-9]{1,3}[A-Z]?)(?:| .*)$/g)[0].split(/(?: or |\/)/g);
            let defaultSubject = '';
            for (let j = 0; j < subcourses.length; ++j) {
                const course = subcourses[j];
                const subject = /[A-Z]{2,6}/g.exec(course) ?
                    /[A-Z]{2,6}/g.exec(course)[0] : defaultSubject;
                defaultSubject = subject;
                const catalog = /[0-9]{1,3}[A-Z]?/g.exec(course)[0];
                if (/Topic [0-9]*:?[^)]*/g.exec(courses[i].trim())) {
                    const topics = /Topic [0-9]*:?[^)]*/g.exec(courses[i].trim())[0].split(';');
                    parseTopics(fastify, topics, requisiteType, subject, catalog, id);
                }
                else if (/(?:taken|prior)/g.exec(courses[i].trim())) {
                    const terms = /(?:taken|prior)[^)]*/g.exec(courses[i].trim())[0].split(/(?:,\s*|(?<=(?:taken|prior).*)\s+(?=fall|winter|spring))/g);
                    parseTerms(fastify, terms, requisiteType, subject, catalog, id);
                }
                else {
                    db.insertPseudoCourses(fastify, id, Object.assign(Object.assign({}, nullPseudoCourse), { subject: subject, catalogNumber: catalog }), 'Prerequisite');
                }
            }
        }
        else {
            const course = /[A-Z]{2,6}\s*[0-9]{1,3}[A-Z]?/g.exec(courses[i].trim());
            const subject = /[A-Z]{2,6}/g.exec(course[0].replace(/\s/g, ''))[0];
            const catalog = /[0-9]{1,3}[A-Z]?/g.exec(course[0].replace(/\s/g, ''))[0];
            if (/Topic [0-9]*:?[^)]*/g.exec(courses[i].trim())) {
                const topics = /Topic [0-9]*:?[^)]*/g.exec(courses[i].trim())[0].split(';');
                parseTopics(fastify, topics, requisiteType, subject, catalog, id);
            }
            else if (/(?:taken|prior)/g.exec(courses[i].trim())) {
                const terms = /(?:taken|prior)[^)]*/g.exec(courses[i].trim())[0].split(/(?:,\s*|(?<=(?:taken|prior).*)\s+(?=fall|winter|spring))/g);
                parseTerms(fastify, terms, requisiteType, subject, catalog, id);
            }
            else {
                db.insertPseudoCourses(fastify, id, Object.assign(Object.assign({}, nullPseudoCourse), { subject: subject, catalogNumber: catalog }), 'Prerequisite');
            }
        }
    }
}
async function parseTopics(fastify, topics, requisiteType, subject, catalog, id) {
    for (let i = 0; i < topics.length; ++i) {
        const topic = topics[i].replace(/Topic [0-9]*:?/g, '').trim();
        db.insertPseudoCourses(fastify, id, Object.assign(Object.assign({}, nullPseudoCourse), { subject: subject, catalogNumber: catalog, topic: topic }), 'Prerequisite');
    }
}
async function parseTerms(fastify, terms, requisiteType, subject, catalog, id) {
    const comp = /taken in or before/g.exec(terms[0]) ? '<=' :
        /(?:|taken)\s*(?:before|prior to)[^)]*/g.exec(terms[0]) ? '<' :
            '';
    let defaultTerm = '';
    for (let i = 1; i < terms.length; ++i) {
        const data = terms[i].split(' ');
        let term = comp;
        if (data[0] === 'winter') {
            term += 'W';
            defaultTerm = 'W';
        }
        else if (data[0] === 'fall') {
            term += 'F';
            defaultTerm = 'F';
        }
        else if (data[0] === 'spring') {
            term += 'S';
            defaultTerm = 'S';
        }
        else
            term += defaultTerm;
        term += data.length > 1 ? data[1] : data[0];
        db.insertPseudoCourses(fastify, id, Object.assign(Object.assign({}, nullPseudoCourse), { subject: subject, catalogNumber: catalog, term: term }), 'Prerequisite');
    }
}
const nullPrerequisite = {
    amount: null,
    parentId: null,
    courseId: null,
    requisiteType: null,
    requisiteSubtype: null,
    grade: null,
    courses: null
};
const nullPseudoCourse = {
    subject: null,
    catalogNumber: null,
    minCatalogNumber: null,
    maxCatalogNumber: null,
    topic: null,
    term: null,
    component: null,
    faculty: null
};
