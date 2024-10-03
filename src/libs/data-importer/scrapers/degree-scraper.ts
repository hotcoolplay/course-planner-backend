import { Page, Browser, ElementHandle } from "puppeteer";
import { FastifyInstance } from "fastify";
import * as util from "./scraper-utilities.js";

type DegreeProperties = {
  name: string | null;
};

export async function scrapeDegrees(
  fastify: FastifyInstance,
  browser: Browser,
  link: string,
): Promise<DegreeProperties> {
  const degreePage = await browser.newPage();
  await degreePage.goto(link);
  const popup = await degreePage.$("#sliding-popup");
  if (popup) {
    await degreePage.evaluate((el) => el.remove(), popup);
  }
  const nameSelector = "xpath///h2";
  await degreePage.waitForSelector(nameSelector);
  const degreeName = await degreePage.$eval(
    nameSelector,
    (el: Element) => el.textContent,
  );
  if (degreeName) {
    const names = degreeName.split(" Degree Requirements");
    const name = names[1] === " (Health)" ? names[0] + names[1] : names[0];
    degreePage.close();
    return { name: name };
  } else {
    degreePage.close();
    throw new Error("Couldn't fetch degree name!");
  }
}
