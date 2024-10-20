import * as util from "../scraper-utilities.js";
import { parsePrerequisite } from "../prerequisite-parser/prerequisites.js";
import * as db from "./scraper-db.js";
export async function scrapeCourse(fastify, browser, page, subject, catalog) {
    if (subject === "MSCI")
        subject = "MSE";
    if (catalog === "-----")
        return { units: null, completions: null, simulEnroll: null };
    const subjectSelector = `xpath///div[contains(@name, "(${subject})")]/div/button`;
    try {
        await page.waitForSelector(subjectSelector, { timeout: 5000 });
    }
    catch (err) {
        console.error(err);
    }
    const button = await page.$(subjectSelector);
    if (!button) {
        console.error("Can't expand subject section!");
        return { units: null, completions: null, simulEnroll: null };
    }
    const expanded = await page.evaluate((el) => el.getAttribute("aria-expanded"), button);
    if (expanded === "false") {
        await page.click(subjectSelector);
    }
    const linkSelector = `div[name*="(${subject})"] a[href*="${subject}${catalog}"]`;
    try {
        await page.waitForSelector(linkSelector, { timeout: 3000 });
        const link = await page.$eval(linkSelector, (el) => el.href);
        const coursePage = await browser.newPage();
        await coursePage.goto(link);
        const unitsHeading = "Units";
        const units = (await util.fetchSectionContent(coursePage, unitsHeading, true))[0];
        if (units === null) {
            coursePage.close();
            console.error("No units in the course!");
            return { units: null, completions: null, simulEnroll: null };
        }
        const completionsHeading = "Total Completions Allowed (Subject to Different Content)";
        const completions = (await util.fetchSectionContent(coursePage, completionsHeading, false))[0];
        const simulEnrollHeading = "Allow Multiple Enrol in a Term";
        const simulEnroll = (await util.fetchSectionContent(coursePage, simulEnrollHeading, false))[0];
        const courseId = await db.searchCourseIds(fastify, subject, catalog);
        let coreqId = null;
        const prereq = "Prerequisites";
        const prereqNode = await util.returnElement(coursePage, prereq);
        if (prereqNode)
            coreqId = await fetchPrerequisites(fastify, prereqNode, "prereq", null, courseId, null);
        const coreq = "Corequisites";
        const coreqNode = await util.returnElement(coursePage, coreq);
        if (coreqNode) {
            if (coreqId) {
                await fetchPrerequisites(fastify, coreqNode, "coreq", null, null, coreqId);
            }
            else {
                await fetchPrerequisites(fastify, coreqNode, "coreq", null, courseId, null);
            }
        }
        const antireq = "Antirequisites";
        const antireqNode = await util.returnElement(coursePage, antireq);
        if (antireqNode)
            await fetchPrerequisites(fastify, antireqNode, "antireq", null, courseId, null);
        coursePage.close();
        return {
            units: Number(units),
            completions: completions ? Number(completions) : 1,
            simulEnroll: simulEnroll === "Yes",
        };
    }
    catch (err) {
        console.error(err);
        return { units: null, completions: null, simulEnroll: null };
    }
}
async function fetchPrerequisites(fastify, el, requisiteType, coreqId, courseId, prerequisiteId) {
    const nodes = await el.$$(`::-p-xpath(./*[not(self::span) and not(self::a)])`);
    const text = await util.cleanText(el);
    let newCoreqId = null;
    if (text && text !== "") {
        const props = await parsePrerequisite(fastify, text, requisiteType, prerequisiteId, courseId, coreqId);
        if (props.coreqId)
            newCoreqId = props.coreqId;
        for (let i = 0; i < nodes.length; ++i) {
            if (!props.requisiteType)
                throw new Error(`No requisite type for ${courseId ? courseId : prerequisiteId}`);
            const tempCoreqId = await fetchPrerequisites(fastify, nodes[i], props.requisiteType, props.coreqId, null, props.parentPrerequisiteId);
            if (tempCoreqId)
                newCoreqId = tempCoreqId;
        }
    }
    else {
        for (let i = 0; i < nodes.length; ++i) {
            const tempCoreqId = await fetchPrerequisites(fastify, nodes[i], requisiteType, coreqId, courseId, prerequisiteId);
            if (tempCoreqId)
                newCoreqId = tempCoreqId;
        }
    }
    return newCoreqId;
}
