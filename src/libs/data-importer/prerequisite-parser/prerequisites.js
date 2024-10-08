import * as db from "./prerequisite-db.js";
import * as util from "../scrapers/scraper-utilities.js";
async function parsePrerequisite(fastify, requirement, requisiteType, parentPrerequisiteId, parentCourseId, coreqId) {
    requirement = requirement.replace(/MSC(?:i|I)/g, "MSCI");
    requirement = requirement.replace("BUS498KW", "BUS498W");
    const coursePrereq = /^a<([A-Z]{2,6}\s?[0-9]{1,3}[A-Z]?)> - .+ \([0-9].[0-9]{2}\)$/g.exec(requirement);
    const parentPrereq = /^(?:Must have c|C)omplete(?:|d)(| or concurrently enrolled in)(?:| at least)(| [1-9]| one| all)(?:| of)(?:| the following)(?:| course):?\s*$/g.exec(requirement);
    const pseudoCoursePrereq = /^(?:Must have c|C)omplete(?:|d)(| or concurrently enrolled in)(?:| at least)(| [1-9]| one| all)(?:| of)(?:| the following)(?:| course):?\s*((?:(?:(?:[A-Z]{2,6}\s*[0-9]{1,3}[A-Z]?(?:(?: or |\/)[A-Z]{0,6}\s*[0-9]{3}K?[A-Z]?)*))*\s*(?:|\(Topic [0-9]*:?[^)]*|\(?(?:taken|prior to)[^)]*)\)?,?\s*)+)$/g.exec(requirement);
    const parentAntireq = /^\s*Not complete(?:|d)(?:| nor| or)(?:| concurrently| currently)(?:| enrolled)(?:| in)(?:| any of)(?:| the following):?\s*$/g.exec(requirement);
    const pseudoCourseAntireq = /^\s*Not complete(?:|d)(?:| nor| or)(?:| concurrently| currently)(?:| enrolled)(?:| in)(?:| any of)(?:| the following):?\s*((?:(?:(?:[A-Z]{2,6}\s*[0-9]{1,3}[A-Z]?(?:(?: or |\/)[A-Z]{0,6}\s*[0-9]{3}K?[A-Z]?)*))*\s*(?:|\(Topic [0-9]*:?[^)]*|\(?(?:taken|prior to)[^)]*)\)?,?\s*)+)$/g.exec(requirement);
    const levelPrereq = /^Students must be in level ([1-9][AB])(| or higher)$/g.exec(requirement);
    const gradePrereq = /^Earned a minimum grade of ([0-9]{2})% in (each|at least [1-9]) of the following: $/g.exec(requirement);
    const unitPrereq = /^Earned (?:|at least )([0-9.]{1,4}) units from((?: [A-Z]{2,6},?(?:| or))+)( [0-9]{3} - [0-9]{3}| [0-9]{3}-level studio courses)*$/g.exec(requirement);
    const cumulativeAveragePrereq = /^(?:Must have e|E)arned a minimum cumulative average of ([0-9]{2})(?:|.0|.0%|.0%.)$/g.exec(requirement);
    const programAveragePrereq = /^(?:Must have e|E)arned a minimum \s*(?:|cumulative)\s*(major|[A-Z]{2,6}|[A-Z]{2,6}\s*major|(?:[A-Z][a-z]+\s*)+|(?:[A-Z][a-z]+\s*)+\s*major)\s* average of ([0-9]{2})(?:|.0|.0%|.0%.)$/g.exec(requirement);
    const attachedCoreq = /^(?:See c|C)ore(?:|re)quisite(?:|s)(?:| \(see below\))$/g.exec(requirement);
    const programPrereq = /^Enrolled in ((?:(?:\s*or\s*|\s*)a<[^>]*>,?)+)$/g.exec(requirement);
    if (coursePrereq) {
        const subject = /^[A-Z]{2,6}/.exec(coursePrereq[1])[0];
        const catalog = /[0-9]{1,3}[A-Z]?$/.exec(coursePrereq[1])[0];
        const courseId = await db.searchCourses(fastify, subject, catalog);
        await db.insertCoursePrerequisites(fastify, {
            parentPrerequisiteId: parentPrerequisiteId,
            parentCourseId: parentCourseId,
            requisiteType: requisiteType,
            requisiteSubtype: "course",
            courseId: courseId,
        });
        return [null, coreqId];
    }
    else if (parentPrereq) {
        if (parentPrereq[1] !== "")
            requisiteType = "coreq";
        const amount = parentPrereq[2] === "" || parentPrereq[2].trim() === "all"
            ? 0
            : parentPrereq[2] === " one"
                ? 1
                : Number(parentPrereq[2].trim());
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { amount: amount, requisiteType: requisiteType, requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId }));
        return [parentPrerequisiteId, coreqId];
    }
    else if (pseudoCoursePrereq) {
        if (pseudoCoursePrereq[1] !== "")
            requisiteType = "coreq";
        const amount = pseudoCoursePrereq[2] === "" || pseudoCoursePrereq[2].trim() === "all"
            ? 0
            : pseudoCoursePrereq[2] === " one"
                ? 1
                : Number(pseudoCoursePrereq[2].trim());
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { amount: amount, requisiteType: requisiteType, requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId }));
        const courses = pseudoCoursePrereq[3].split(/(?<!\([^)]*),\s+(?!(?:|fall|winter|spring)\s*[0-9]{4})/g);
        parseCourses(fastify, courses, requisiteType, parentPrerequisiteId);
        return [null, coreqId];
    }
    else if (parentAntireq) {
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { amount: 1, requisiteType: "antireq", requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId }));
        return [parentPrerequisiteId, coreqId];
    }
    else if (pseudoCourseAntireq) {
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { amount: 1, requisiteType: "antireq", requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId }));
        const courses = pseudoCourseAntireq[1].split(/(?<!\([^)]*),\s+(?!(?:|fall|winter|spring)\s*[0-9]{4})/g);
        parseCourses(fastify, courses, "antireq", parentPrerequisiteId);
        return [null, coreqId];
    }
    else if (levelPrereq) {
        const level = levelPrereq[1];
        db.insertLevelPrerequisites(fastify, {
            level: levelPrereq[2] === "" ? level : level + "+",
            requisiteType: "prereq",
            requisiteSubtype: "level",
            parentCourseId: parentCourseId,
            parentPrerequisiteId: parentPrerequisiteId,
        });
        return [null, coreqId];
    }
    else if (gradePrereq) {
        const grade = Number(/[0-9]{2}/.exec(gradePrereq[1]));
        const amt = gradePrereq[2] === "each" ? 0 : Number(/[1-9]/.exec(gradePrereq[2]));
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { amount: amt, grade: grade, requisiteType: "prereq", requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId }));
        return [parentPrerequisiteId, coreqId];
    }
    else if (unitPrereq) {
        const units = Number(unitPrereq[1]);
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { requisiteType: "prereq", requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId, units: units }));
        const subjects = unitPrereq[2]
            .replace(/\s/g, "")
            .replace("or", "")
            .split(",");
        let minCatalogNumber = null;
        let maxCatalogNumber = null;
        let component = null;
        if (/[0-9]{3} - [0-9]{3}/g.exec(unitPrereq[3])) {
            minCatalogNumber = Number(unitPrereq[3].split("-")[0].trim());
            maxCatalogNumber = Number(unitPrereq[3].split("-")[1].trim());
        }
        else if (/[0-9]{3}-level studio courses/g.exec(unitPrereq[3])) {
            const level = Number(/[0-9]{3}/g.exec(unitPrereq[3])[1]);
            minCatalogNumber = level;
            maxCatalogNumber = level + 99;
            component = "STU";
        }
        for (let i = 0; i < subjects.length; ++i) {
            db.insertPseudoCoursePrerequisites(fastify, Object.assign(Object.assign({}, nullPseudoCoursePrerequisite), { requisiteType: "prereq", requisiteSubtype: "pseudoCourse", parentPrerequisiteId: parentPrerequisiteId, subject: subjects[i], minCatalogNumber: minCatalogNumber, maxCatalogNumber: maxCatalogNumber, component: component }));
        }
        return [null, coreqId];
    }
    else if (cumulativeAveragePrereq) {
        const cumulativeAverage = Number(cumulativeAveragePrereq[1]);
        db.insertCumulativeAveragePrerequisites(fastify, {
            requisiteType: "prereq",
            requisiteSubtype: "cumulativeAverage",
            parentCourseId: parentCourseId,
            parentPrerequisiteId: parentPrerequisiteId,
            cumulativeAverage: cumulativeAverage,
        });
        return [null, coreqId];
    }
    else if (programAveragePrereq) {
        const average = Number(programAveragePrereq[2]);
        if (programAveragePrereq[1] === "major") {
            db.insertMajorAveragePrerequisites(fastify, {
                requisiteType: "prereq",
                requisiteSubtype: "majorAverage",
                parentCourseId: parentCourseId,
                parentPrerequisiteId: parentPrerequisiteId,
                majorAverage: average,
            });
        }
        else {
            let programName = programAveragePrereq[1].split(/\s+major/g)[0];
            if (programName === "ANTH")
                programName = "Anthropology";
            else if (programName === "HRM")
                programName = "Human Resources Management";
            const programs = await db.searchPrograms(fastify, programName);
            parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { requisiteType: "prereq", requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId, programAverage: average }));
            for (const program of programs) {
                db.insertProgramPrerequisites(fastify, {
                    requisiteType: "prereq",
                    requisiteSubtype: "program",
                    parentCourseId: null,
                    parentPrerequisiteId: parentPrerequisiteId,
                    programId: program,
                });
            }
        }
        return [null, coreqId];
    }
    else if (attachedCoreq) {
        return [null, parentPrerequisiteId];
    }
    else if (programPrereq) {
        parentPrerequisiteId = await db.insertParentPrerequisites(fastify, Object.assign(Object.assign({}, nullParentPrerequisite), { requisiteType: "prereq", requisiteSubtype: "parent", parentCourseId: parentCourseId, parentPrerequisiteId: parentPrerequisiteId, amount: 1 }));
        const programText = programPrereq[1];
        const programs = programText.match(/(?<=a<)[^>]*(?=>)/g);
        for (const program of programs) {
            const programId = await util.convertProgramName(fastify, program);
            db.insertProgramPrerequisites(fastify, {
                requisiteType: "prereq",
                requisiteSubtype: "program",
                parentCourseId: null,
                parentPrerequisiteId: parentPrerequisiteId,
                programId: programId,
            });
        }
        return [null, coreqId];
    }
    else {
        console.log(requirement);
        db.insertOtherPrerequisites(fastify, {
            requisiteType: requisiteType,
            requisiteSubtype: "other",
            parentCourseId: parentCourseId,
            parentPrerequisiteId: parentPrerequisiteId,
            other: requirement,
        });
        return [null, coreqId];
    }
}
async function parseCourses(fastify, courses, requisiteType, id) {
    for (let i = 0; i < courses.length; ++i) {
        if (/(?<=(?:\/| or )[A-Z]{0,6}\s*[0-9]{1,3}[A-Z]?)(?:| .*)$/g.exec(courses[i])) {
            const subcourses = courses[i]
                .split(/(?<=(?:\/| or )[A-Z]{0,6}\s*[0-9]{1,3}[A-Z]?)(?:| .*)$/g)[0]
                .split(/(?: or |\/)/g);
            let defaultSubject = "";
            for (let j = 0; j < subcourses.length; ++j) {
                const course = subcourses[j];
                const subject = /[A-Z]{2,6}/g.exec(course)
                    ? /[A-Z]{2,6}/g.exec(course)[0]
                    : defaultSubject;
                defaultSubject = subject;
                const catalog = /[0-9]{1,3}[A-Z]?/g.exec(course)[0];
                if (/Topic [0-9]*:?[^)]*/g.exec(courses[i].trim())) {
                    const topics = /Topic [0-9]*:?[^)]*/g
                        .exec(courses[i].trim())[0]
                        .split(";");
                    parseTopics(fastify, topics, requisiteType, subject, catalog, id);
                }
                else if (/(?:taken|prior)/g.exec(courses[i].trim())) {
                    const terms = /(?:taken|prior)[^)]*/g
                        .exec(courses[i].trim())[0]
                        .split(/(?:,\s*|(?<=(?:taken|prior).*)\s+(?=fall|winter|spring))/g);
                    parseTerms(fastify, terms, requisiteType, subject, catalog, id);
                }
                else {
                    db.insertPseudoCoursePrerequisites(fastify, Object.assign(Object.assign({}, nullPseudoCoursePrerequisite), { requisiteType: requisiteType, requisiteSubtype: "pseudoCourse", parentPrerequisiteId: id, subject: subject, catalogNumber: catalog }));
                }
            }
        }
        else {
            const course = /[A-Z]{2,6}\s*[0-9]{1,3}[A-Z]?/g.exec(courses[i].trim());
            const subject = /[A-Z]{2,6}/g.exec(course[0].replace(/\s/g, ""))[0];
            const catalog = /[0-9]{1,3}[A-Z]?/g.exec(course[0].replace(/\s/g, ""))[0];
            if (/Topic [0-9]*:?[^)]*/g.exec(courses[i].trim())) {
                const topics = /Topic [0-9]*:?[^)]*/g
                    .exec(courses[i].trim())[0]
                    .split(";");
                parseTopics(fastify, topics, requisiteType, subject, catalog, id);
            }
            else if (/(?:taken|prior)/g.exec(courses[i].trim())) {
                const terms = /(?:taken|prior)[^)]*/g
                    .exec(courses[i].trim())[0]
                    .split(/(?:,\s*|(?<=(?:taken|prior).*)\s+(?=fall|winter|spring))/g);
                parseTerms(fastify, terms, requisiteType, subject, catalog, id);
            }
            else {
                db.insertPseudoCoursePrerequisites(fastify, Object.assign(Object.assign({}, nullPseudoCoursePrerequisite), { requisiteType: requisiteType, requisiteSubtype: "pseudoCourse", parentPrerequisiteId: id, subject: subject, catalogNumber: catalog }));
            }
        }
    }
}
async function parseTopics(fastify, topics, requisiteType, subject, catalog, id) {
    for (let i = 0; i < topics.length; ++i) {
        const topic = topics[i].replace(/Topic [0-9]*:?/g, "").trim();
        db.insertPseudoCoursePrerequisites(fastify, Object.assign(Object.assign({}, nullPseudoCoursePrerequisite), { requisiteType: requisiteType, requisiteSubtype: "pseudoCourse", parentPrerequisiteId: id, subject: subject, catalogNumber: catalog, topic: topic }));
    }
}
async function parseTerms(fastify, terms, requisiteType, subject, catalog, id) {
    const comp = /taken in or before/g.exec(terms[0])
        ? "<="
        : /(?:|taken)\s*(?:before|prior to)[^)]*/g.exec(terms[0])
            ? "<"
            : "";
    let defaultTerm = "";
    for (let i = 1; i < terms.length; ++i) {
        const data = terms[i].split(" ");
        let term = comp;
        if (data[0] === "winter") {
            term += "W";
            defaultTerm = "W";
        }
        else if (data[0] === "fall") {
            term += "F";
            defaultTerm = "F";
        }
        else if (data[0] === "spring") {
            term += "S";
            defaultTerm = "S";
        }
        else
            term += defaultTerm;
        term += data.length > 1 ? data[1] : data[0];
        db.insertPseudoCoursePrerequisites(fastify, Object.assign(Object.assign({}, nullPseudoCoursePrerequisite), { requisiteType: requisiteType, requisiteSubtype: "pseudoCourse", parentPrerequisiteId: id, subject: subject, catalogNumber: catalog, term: term }));
    }
}
const nullPseudoCoursePrerequisite = {
    parentCourseId: null,
    parentPrerequisiteId: null,
    requisiteType: "prereq",
    requisiteSubtype: "pseudoCourse",
    subject: null,
    catalogNumber: null,
    minCatalogNumber: null,
    maxCatalogNumber: null,
    topic: null,
    term: null,
    component: null,
};
const nullPseudoProgramPrerequisite = {
    parentCourseId: null,
    parentPrerequisiteId: null,
    requisiteType: "prereq",
    requisiteSubtype: "pseudoCourse",
    faculty: null,
    majorType: null,
    majorSystem: null,
};
const nullParentPrerequisite = {
    parentCourseId: null,
    parentPrerequisiteId: null,
    requisiteType: "prereq",
    requisiteSubtype: "parent",
    amount: null,
    grade: null,
    units: null,
    programAverage: null,
    prerequisites: null,
};
