import * as util from "../scraper-utilities.js";
import * as db from "./scraper-db.js";
export async function scrapePrograms(fastify, browser, link) {
    const programPage = await browser.newPage();
    await programPage.goto(link);
    const urlCode = link.split("catalog#/programs/")[1].split("?bc")[0];
    const popup = await programPage.$("#sliding-popup");
    if (popup) {
        await programPage.evaluate((el) => el.remove(), popup);
    }
    const nameSelector = "xpath///h2";
    await programPage.waitForSelector(nameSelector);
    const name = await programPage.$eval(nameSelector, (el) => el.textContent);
    if (name) {
        const programSubtype = determineProgramSubtype(name);
        let props = {
            name: name,
            programSubtype: programSubtype,
            urlCode: urlCode,
        };
        switch (programSubtype) {
            case "Major":
                props = await scrapeMajors(fastify, programPage, props);
                programPage.close();
                return props;
            case "Specialization":
                props = await scrapeSpecializations(fastify, programPage, props);
                programPage.close();
                return props;
            case "Option":
                props = await scrapeOptions(fastify, programPage, props);
                programPage.close();
                return props;
            default:
                programPage.close();
                return props;
        }
    }
    else {
        programPage.close();
        throw new Error(`No program name for ${urlCode}!`);
    }
}
async function scrapeMajors(fastify, page, programProperties) {
    const majorType = determineMajorType(programProperties.name);
    const degreeId = await determineDegreeId(fastify, programProperties.name);
    const systemsHeading = `Systems of Study`;
    const systems = await util.fetchSectionContent(page, systemsHeading, false);
    const regular = systems.length !== 0
        ? determineSystems(systems, "Regular")
        : await db.searchMajorRegular(fastify, programProperties.name.split(" (")[0] + "%");
    const coop = systems.length !== 0
        ? determineSystems(systems, "Co-operative")
        : await db.searchMajorCoop(fastify, programProperties.name.split(" (")[0] + "%");
    if ((regular || coop) && regular !== null && coop !== null) {
        return Object.assign(Object.assign({}, programProperties), { majorType: majorType, degreeId: degreeId, regular: regular, coop: coop });
    }
    else {
        throw new Error(`No valid systems of study for ${programProperties.name}!`);
    }
}
async function scrapeSpecializations(fastify, page, programProperties) {
    const specializationsHeading = `This specialization is available for students in the following majors`;
    const parentMajorElement = await util.returnElement(page, specializationsHeading);
    if (!parentMajorElement)
        throw new Error(`No specializations heading for ${programProperties.name}`);
    const parentMajors = await fetchParentMajors(parentMajorElement);
    if (!parentMajors)
        throw new Error(`Text wasn't properly cleaned in the specializations heading for ${programProperties.name}`);
    const majors = parentMajors.match(/(?<=a<)[^>]+(?=>)/g);
    if (!majors) {
        throw new Error(`Didn't locate any majors in parent majors string!`);
    }
    const majorIds = [];
    for (let i = 0; i < majors.length; ++i) {
        const major = majors[i];
        majorIds.push(await util.convertProgramName(fastify, major));
    }
    return Object.assign(Object.assign({}, programProperties), { parentMajors: majorIds });
}
async function scrapeOptions(fastify, page, programProperties) {
    const optionsHeading = `This option is available for students in the following degrees`;
    const parentDegrees = await util.fetchSectionContent(page, optionsHeading, false);
    const degreeIds = [];
    for (const degree of parentDegrees) {
        console.log(degree);
        const degreeId = await db.fetchDegreeId(fastify, degree);
        if (!degreeId)
            throw new Error(`Invalid parent degree name for ${programProperties.name}!`);
        else {
            degreeIds.push(degreeId);
        }
    }
    return Object.assign(Object.assign({}, programProperties), { parentDegrees: degreeIds });
}
function determineProgramSubtype(name) {
    if (name.includes("Bachelor") ||
        name.includes("Joint Honours") ||
        name.includes("Doctor") ||
        name === "Arts and Business")
        return "Major";
    else if (name.includes("Diploma"))
        return "Diploma";
    else if (name.includes("Minor"))
        return "Minor";
    else if (name.includes("Option"))
        return "Option";
    else if (name.includes("Specialization"))
        return "Specialization";
    else {
        console.log(name);
        throw new Error(`Couldn't find a valid program subtype for ${name}!`);
    }
}
function determineSystems(systems, programSystem) {
    for (const system of systems) {
        if (system === programSystem)
            return true;
    }
    return false;
}
function determineMajorType(name) {
    if (name.includes("Joint Honours"))
        return "JH";
    else if (name === "Arts and Business" ||
        name.includes("Honours") ||
        name.includes("Doctor of Optometry") ||
        name.includes("Doctor of Pharmacy"))
        return "H";
    else if (name.includes("Three-Year General"))
        return "3G";
    else if (name.includes("Four-Year General"))
        return "4G";
    else
        throw new Error(`Couldn't parse type of major in major name for ${name}!`);
}
async function determineDegreeId(fastify, name) {
    // Joint Honours programs don't have their degree in their name
    if (name.includes("Joint Honours")) {
        if (name.includes(" - Joint Honours")) {
            const degreeName = name.split("(")[1].split(" - Joint Honours")[0];
            const degreeId = await db.fetchDegreeId(fastify, degreeName);
            return degreeId;
        }
        else {
            const majorName = name.split(" (")[0] + "%";
            const degreeId = await db.searchDegreeId(fastify, majorName);
            if (!degreeId)
                throw new Error(`Couldn't find corresponding degree for ${name}!`);
            else
                return degreeId;
        }
    }
    else {
        const degreeName = parseDegreeName(name);
        const degreeId = await db.fetchDegreeId(fastify, degreeName);
        if (!degreeId)
            throw new Error(`Couldn't find corresponding degree for ${name}!`);
        else
            return degreeId;
    }
}
function parseDegreeName(name) {
    if (name === "Arts and Business")
        return "Bachelor of Arts";
    else if (name
        .split("(")[1]
        .split(" - ")[0]
        .includes("Bachelor of Business Administration and "))
        return name
            .split("(")[1]
            .split(" - ")[0]
            .split("Bachelor of Business Administration and ")[1];
    // Corner case of (Bachelor of Mathematics, Three-Year General)
    else if (name.split("(")[1].includes(","))
        return name.split("(")[1].split(", ")[0];
    // Corner case of Bachelor of Sciences
    else if (name.split("(")[1].includes("Bachelor of Sciences"))
        return "Bachelor of Science (Environment)";
    // Science/health degrees
    else if (name.split("(")[1].includes("Bachelor of Science")) {
        if (name.split("(")[0].includes("Kinesiology") ||
            name.split("(")[0].includes("Health Sciences"))
            return "Bachelor of Science (Health)";
        else
            return "Bachelor of Science (Science)";
    }
    // Arts/health degrees
    else if (name.split("(")[1].includes("Bachelor of Arts"))
        if (name.split("(")[0].includes("Therapeutic Recreation") ||
            name.split("(")[0].includes("Recreation and Leisure Studies") ||
            name.split("(")[0].includes("Recreation and Sport Business"))
            return "Bachelor of Arts (Health)";
        else
            return "Bachelor of Arts";
    // Default case
    else if (name.split("(")[1].includes(" - "))
        return name.split("(")[1].split(" - ")[0];
    // Med programs
    else
        return name.split("(")[1].split(")")[0];
}
async function fetchParentMajors(el) {
    const node = await el.$(`::-p-xpath(./*[not(self::span) and not(self::a)])`);
    if (!node)
        return await util.cleanText(el);
    else
        return fetchParentMajors(node);
}
