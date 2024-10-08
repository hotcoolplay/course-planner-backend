import * as db from "./scraper-db.js";
const majorTypes = ["H", "JH", "3G", "4G"];
export const PROGRAM_INITIALS = new Map([
    ["CS", "Computer Science"],
    ["CEC", "Climate and Environmental Change"],
    ["G", "Geomatics"],
    ["GEM", "Geography and Environmental Management"],
    ["CE", "Computer Engineering"],
    ["EE", "Electrical Engineering"],
]);
export const DEGREE_INITIALS = new Map([
    ["BMath", "Bachelor of Mathematics"],
    ["BCS", "Bachelor of Computer Science"],
    ["BA", "Bachelor of Arts"],
    ["BSc", "Bachelor of Science (Science)"],
    ["BASc", "Bachelor of Applied Sciences"],
]);
export const PROGRAM_ABBREVIATIONS = new Map([
    [
        "BBA & BMath Double Degree",
        "Business Administration and Mathematics Double Degree",
    ],
    [
        "BBA & BCS Double Degree",
        "Business Administration and Computer Science Double Degree",
    ],
    [
        "Math/FARM - Chartered Financial Analyst Spec",
        "Mathematics/Financial Analysis and Risk Management - Chartered Financial Analyst Specialization",
    ],
    [
        "Math/FARM - Professional Risk Management Spec",
        "Mathematics/Financial Analysis and Risk Management - Professional Risk Management Specialization",
    ],
]);
export async function fetchSectionContent(page, heading, wait) {
    const selector = `::-p-xpath(//*[preceding-sibling::h3[contains(., '${heading}')]]//text())`;
    const content = [];
    if (wait) {
        try {
            await page.waitForSelector(selector);
            const elements = await page.$$(selector);
            if (!elements)
                throw new Error(`Couldn't find elements under ${heading}`);
            else {
                for (let i = 0; i < elements.length; ++i) {
                    const text = await page.evaluate((el) => el.textContent, elements[i]);
                    if (!text)
                        throw new Error("Couldn't evaluate text in element!");
                    else {
                        content.push(text);
                    }
                }
            }
        }
        catch (_a) {
            throw new Error(`Couldn't find ${heading}!`);
        }
    }
    else {
        const elements = await page.$$(selector);
        if (!elements)
            throw new Error(`Couldn't find elements under ${heading}`);
        else {
            for (let i = 0; i < elements.length; ++i) {
                const text = await page.evaluate((el) => el.textContent, elements[i]);
                if (!text)
                    throw new Error("Couldn't evaluate text in element!");
                else {
                    content.push(text);
                }
            }
        }
    }
    return content;
}
export async function cleanText(el) {
    const nodes = await el.$$(`::-p-xpath(./node()[self::a or self::span or self::text()])`);
    let text = "";
    for (let i = 0; i < nodes.length; ++i) {
        const name = await nodes[i].evaluate((el) => el.nodeName);
        if (name === "SPAN")
            text += await cleanText(nodes[i]);
        else if (name === "A")
            text += "a<" + (await cleanText(nodes[i])) + ">";
        else
            text += await nodes[i].evaluate((el) => el.nodeValue);
    }
    // eslint-disable-next-line no-control-regex
    text = text.replace(/[\u0009\n]/g, "").replace("\n", "");
    return text;
}
export async function returnElement(page, heading) {
    const selector = `::-p-xpath(//*[preceding-sibling::h3[contains(., '${heading}')]])`;
    return await page.$(selector);
}
export async function convertProgramName(fastify, name) {
    const hyphenRegex = /(?<=[A-Z])-(?=[A-Z])/g;
    const identifier = name.match(hyphenRegex)
        ? name.split(hyphenRegex)[0]
        : null;
    const degreeName = name.includes("(")
        ? DEGREE_INITIALS.get(name.split("(")[1].split(")")[0])
        : null;
    if (name.includes("(") && !degreeName) {
        throw new Error(`Couldn't grab degree name for ${name} when converting program name!`);
    }
    const degree = degreeName
        ? await db.fetchDegreeId(fastify, degreeName)
        : null;
    let tempProgramName = name.match(hyphenRegex)
        ? name.split(hyphenRegex)[1].includes(" (")
            ? name.split(hyphenRegex)[1].split(" (")[0]
            : name.split(hyphenRegex)[1]
        : name;
    if (tempProgramName.endsWith("Diploma")) {
        tempProgramName = tempProgramName.replace(" Diploma", "");
        tempProgramName = "Diploma in " + tempProgramName;
    }
    const majorType = identifier ? validateMajorType(identifier) : null;
    const parentMajor = identifier && !majorType && PROGRAM_INITIALS.get(identifier)
        ? "%" + PROGRAM_INITIALS.get(identifier) + "%(%"
        : null;
    if (!majorType && !parentMajor && identifier) {
        console.log(name);
        throw new Error(`I'm not sure what this identifier is...${name}`);
    }
    const programName = PROGRAM_ABBREVIATIONS.get(tempProgramName)
        ? ("%" + PROGRAM_ABBREVIATIONS.get(tempProgramName) + "%(%").replace("&", "and")
        : "%" + tempProgramName.replace("&", "and") + "%(%";
    const opts = {
        majorType: majorType,
        parentDegree: degree,
        parentProgram: parentMajor,
    };
    const programId = await db.searchProgramIds(fastify, programName, opts);
    if (!programId) {
        throw new Error(`No matching converted program name for ${name}!`);
    }
    else
        return programId;
}
function validateMajorType(type) {
    if (!type)
        return null;
    const majorType = majorTypes.find((validType) => validType === type);
    if (majorType)
        return majorType;
    else
        return null;
}
