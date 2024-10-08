import * as util from "./scraper-utilities.js";
import { prerequisiteTexts } from "../../../app.js";
export async function scrapeCourse(fastify, browser, page, subject, catalog) {
    if (subject === "MSCI")
        subject = "MSE";
    const subjectSelector = `xpath///div[contains(@name, "(${subject})")]/div/button`;
    await page.waitForSelector(subjectSelector);
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
        if (!units) {
            coursePage.close();
            console.error("No units in the course!");
            return { units: null, completions: null, simulEnroll: null };
        }
        const completionsHeading = "Total Completions Allowed (Subject to Different Content)";
        const completions = (await util.fetchSectionContent(coursePage, completionsHeading, false))[0];
        const simulEnrollHeading = "Allow Multiple Enrol in a Term";
        const simulEnroll = (await util.fetchSectionContent(coursePage, simulEnrollHeading, false))[0];
        const prereq = "Prerequisites";
        const prereqNode = await util.returnElement(coursePage, prereq);
        if (prereqNode)
            await fetchPrerequisites(prereqNode);
        const coreq = "Corequisites";
        const coreqNode = await util.returnElement(coursePage, coreq);
        if (coreqNode)
            await fetchPrerequisites(coreqNode);
        const antireq = "Antirequisites";
        const antireqNode = await util.returnElement(coursePage, antireq);
        if (antireqNode)
            await fetchPrerequisites(antireqNode);
        coursePage.close();
        return {
            units: Number(units),
            completions: completions ? Number(completions) : 1,
            simulEnroll: simulEnroll === "Yes",
        };
    }
    catch (_a) {
        console.error("Couldn't load or access course page!");
        return { units: null, completions: null, simulEnroll: null };
    }
}
async function fetchPrerequisites(el) {
    const nodes = await el.$$(`::-p-xpath(./*[not(self::span) and not(self::a)])`);
    const text = await util.cleanText(el);
    const size1 = prerequisiteTexts.size;
    if (text)
        prerequisiteTexts.add(text);
    const size2 = prerequisiteTexts.size;
    if (size2 > size1)
        console.log(text);
    for (let i = 0; i < nodes.length; ++i) {
        await fetchPrerequisites(nodes[i]);
    }
}
