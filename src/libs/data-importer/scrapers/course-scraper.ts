import { FastifyInstance } from "fastify";
import { Browser, Page, ElementHandle } from "puppeteer";
import * as util from "./scraper-utilities.js";

type CourseProperties = {
  units: number | null;
  completions: number | null;
  simulEnroll: boolean | null;
};

export async function scrapeCourse(
  fastify: FastifyInstance,
  browser: Browser,
  page: Page,
  subject: string,
  catalog: string,
): Promise<CourseProperties> {
  if (subject === "MSCI") subject = "MSE";
  const subjectSelector = `xpath///div[contains(@name, "(${subject})")]/div/button`;
  await page.waitForSelector(subjectSelector);

  const button = await page.$(subjectSelector);
  if (!button) throw new Error("Can't expand subject section!");

  const expanded = await page.evaluate(
    (el: Element) => el.getAttribute("aria-expanded"),
    button,
  );
  if (expanded === "false") {
    await page.click(subjectSelector);
  }
  const linkSelector = `div[name*="(${subject})"] a[href*="${subject}${catalog}"]`;
  try {
    await page.waitForSelector(linkSelector, { timeout: 3000 });
    const link = await page.$eval(
      linkSelector,
      (el: Element) => (<HTMLAnchorElement>el).href,
    );
    const coursePage = await browser.newPage();
    await coursePage.goto(link);

    const unitsHeading = "Units";
    const units = (
      await util.fetchSectionContent(coursePage, unitsHeading, true)
    )[0];
    if (!units) {
      coursePage.close();
      throw new Error("No units in the course!");
    }

    const completionsHeading =
      "Total Completions Allowed (Subject to Different Content)";
    const completions = (
      await util.fetchSectionContent(coursePage, completionsHeading, false)
    )[0];

    const simulEnrollHeading = "Allow Multiple Enrol in a Term";
    const simulEnroll = (
      await util.fetchSectionContent(coursePage, simulEnrollHeading, false)
    )[0];

    const prereq = "Prerequisites";
    const prereqNode = await util.returnElement(coursePage, prereq);
    if (prereqNode) await fetchPrerequisites(prereqNode);

    const coreq = "Corequisites";
    const coreqNode = await util.returnElement(coursePage, coreq);
    if (coreqNode) await fetchPrerequisites(coreqNode);

    const antireq = "Antirequisites";
    const antireqNode = await util.returnElement(coursePage, antireq);
    if (antireqNode) await fetchPrerequisites(antireqNode);

    coursePage.close();
    return {
      units: Number(units),
      completions: completions ? Number(completions) : 1,
      simulEnroll: simulEnroll === "Yes",
    };
  } catch {
    throw new Error("Couldn't load or access course page!");
  }
}

async function fetchPrerequisites(el: ElementHandle) {
  const nodes = await el.$$(
    `::-p-xpath(./*[not(self::span) and not(self::a)])`,
  );
  const text = await util.cleanText(el);
  for (let i = 0; i < nodes.length; ++i) {
    await fetchPrerequisites(nodes[i]);
  }
}
