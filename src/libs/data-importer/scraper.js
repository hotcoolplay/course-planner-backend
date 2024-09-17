"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeCourse = exports.scrapePrograms = exports.scrapeDegrees = void 0;
const app_1 = require("../../app");
async function scrapeDegrees(fastify, browser, link) {
    const degreePage = await browser.newPage();
    await degreePage.goto(link);
    const popup = await degreePage.$('#sliding-popup');
    if (popup) {
        await degreePage.evaluate((el) => el.remove(), popup);
    }
    const nameSelector = 'xpath///h2';
    await degreePage.waitForSelector(nameSelector);
    const degreeName = await degreePage.$eval(nameSelector, (el) => el.textContent);
    if (degreeName) {
        const names = degreeName.split(' Degree Requirements');
        const name = names[1] === (' (Health)') ? names[0] + names[1] : names[0];
        degreePage.close();
        return { name: name };
    }
    else {
        degreePage.close();
        return { name: null };
    }
}
exports.scrapeDegrees = scrapeDegrees;
async function scrapePrograms(fastify, browser, link) {
    const programPage = await browser.newPage();
    await programPage.goto(link);
    const urlCode = link.split('catalog#/programs/')[1].split('?bc')[0];
    const popup = await programPage.$('#sliding-popup');
    if (popup) {
        await programPage.evaluate((el) => el.remove(), popup);
    }
    const nameSelector = 'xpath///h2';
    await programPage.waitForSelector(nameSelector);
    const name = await programPage.$eval(nameSelector, (el) => el.textContent);
    if (name) {
        let subtype;
        if (name.includes('Bachelor') || name.includes('Joint Honours')
            || name.includes('Doctor') || name === 'Arts and Business')
            subtype = 'Major';
        else if (name.includes('Diploma'))
            subtype = 'Diploma';
        else if (name.includes('Minor'))
            subtype = 'Minor';
        else if (name.includes('Option'))
            subtype = 'Option';
        else if (name.includes('Specialization'))
            subtype = 'Specialization';
        else {
            programPage.close();
            return { name: null, programSubtype: null, urlCode: null };
        }
        programPage.close();
        const programSubtype = subtype;
        return { name: name, programSubtype: programSubtype, urlCode: urlCode };
    }
    else {
        programPage.close();
        return { name: null, programSubtype: null, urlCode: null };
    }
}
exports.scrapePrograms = scrapePrograms;
async function scrapeCourse(fastify, browser, page, subject, catalog) {
    if (subject === 'MSCI')
        subject = 'MSE';
    const subjectSelector = `xpath///div[contains(@name, "(${subject})")]/div/button`;
    await page.waitForSelector(subjectSelector);
    const button = await page.$(subjectSelector);
    if (!button)
        return { units: null, completions: null, simulEnroll: null };
    const expanded = await page.evaluate((el) => el.getAttribute('aria-expanded'), button);
    if (expanded === 'false') {
        await page.click(subjectSelector);
    }
    const linkSelector = `div[name*="(${subject})"] a[href*="${subject}${catalog}"]`;
    try {
        await page.waitForSelector(linkSelector, { timeout: 3000 });
        const link = await page.$eval(linkSelector, (el) => el.href);
        const coursePage = await browser.newPage();
        await coursePage.goto(link);
        const unitsHeading = "Units";
        const units = await pullText(coursePage, unitsHeading, true);
        if (units === null) {
            coursePage.close();
            return { units: null, completions: null, simulEnroll: null };
        }
        const completionsHeading = "Total Completions Allowed (Subject to Different Content)";
        const completions = await pullText(coursePage, completionsHeading, false);
        const simulEnrollHeading = 'Allow Multiple Enrol in a Term';
        const simulEnroll = await pullText(coursePage, simulEnrollHeading, false);
        const prereq = 'Prerequisites';
        const prereqNode = await returnElement(coursePage, prereq);
        if (prereqNode)
            await fetchPrerequisites(prereqNode);
        const coreq = 'Corequisites';
        const coreqNode = await returnElement(coursePage, coreq);
        if (coreqNode)
            await fetchPrerequisites(coreqNode);
        const antireq = 'Antirequisites';
        const antireqNode = await returnElement(coursePage, antireq);
        if (antireqNode)
            await fetchPrerequisites(antireqNode);
        coursePage.close();
        return { units: Number(units), completions: completions ? Number(completions) : 1, simulEnroll: simulEnroll === 'Yes' };
    }
    catch (err) {
        return { units: null, completions: null, simulEnroll: null };
    }
}
exports.scrapeCourse = scrapeCourse;
async function pullText(page, heading, wait) {
    const selector = `::-p-xpath(//*[preceding-sibling::h3[contains(., '${heading}')]]//text())`;
    if (wait) {
        try {
            await page.waitForSelector(selector);
            const element = await page.$(selector);
            return !element ? null : await page.evaluate((el) => el.textContent, element);
        }
        catch (err) {
            return null;
        }
    }
    else {
        const element = await page.$(selector);
        return !element ? null : await page.evaluate((el) => el.textContent, element);
    }
}
async function fetchPrerequisites(el) {
    const nodes = await el.$$(`::-p-xpath(./*[not(self::span) and not(self::a)])`);
    const text = await cleanText(el);
    const size1 = app_1.prerequisiteTexts.size;
    if (text)
        app_1.prerequisiteTexts.add(text);
    const size2 = app_1.prerequisiteTexts.size;
    if (size2 > size1)
        console.log(text);
    for (let i = 0; i < nodes.length; ++i) {
        await fetchPrerequisites(nodes[i]);
    }
}
async function cleanText(el) {
    const nodes = await el.$$(`::-p-xpath(./node()[self::a or self::span or self::text()])`);
    let text = '';
    for (let i = 0; i < nodes.length; ++i) {
        const name = await nodes[i].evaluate((el) => el.nodeName);
        if (name === 'SPAN' || name === 'A')
            text += await cleanText(nodes[i]);
        else
            text += await nodes[i].evaluate((el) => el.nodeValue);
    }
    text = text.replace(/[\u0009\n]/g, '').replace('\n', '');
    return text;
}
async function returnElement(page, heading) {
    const selector = `::-p-xpath(//*[preceding-sibling::h3[contains(., '${heading}')]])`;
    return await page.$(selector);
}
