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
exports.requestTermCourseList = exports.requestTerms = exports.requestCourses = exports.requestPrograms = exports.requestDegrees = void 0;
const db = __importStar(require("./insertdb"));
const scraper = __importStar(require("./scraper"));
const axios_1 = __importDefault(require("axios"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
async function requestDegrees(fastify) {
    const uGradUrl = 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs';
    const stealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer_extra_1.default.use(stealthPlugin());
    const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
    puppeteer_extra_1.default.use(AdblockerPlugin());
    console.log('Launching puppeteer...');
    const browser = await puppeteer_extra_1.default.launch();
    console.log('Opening undergrad page...');
    const page = await browser.newPage();
    console.log('Going to url...');
    await page.goto(uGradUrl);
    console.log('Scraping degrees...');
    const popup = await page.$('#sliding-popup');
    if (popup) {
        await page.evaluate((el) => el.remove(), popup);
    }
    const buttonSelector = 'xpath///li/div[contains(@name, "Degree")]/div/button';
    await page.waitForSelector(buttonSelector);
    const buttons = await page.$$(buttonSelector);
    for (const el of buttons) {
        await el.click();
    }
    const linkSelector = 'xpath///li/div/div/div/div/ul//a';
    await page.waitForSelector(linkSelector);
    const links = await page.$$(linkSelector);
    for (let i = 0; i < links.length; ++i) {
        const link = await page.evaluate((el) => el.href, links[i]);
        const degreeData = await scraper.scrapeDegrees(fastify, browser, link);
        if (degreeData.name) {
            const degree = {
                name: degreeData.name
            };
            await db.insertDegrees(fastify, degree);
            console.log(`Inserted ${i + 1} of ${links.length} degrees...`);
        }
    }
}
exports.requestDegrees = requestDegrees;
async function requestPrograms(fastify) {
    const uGradUrl = 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs';
    const stealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer_extra_1.default.use(stealthPlugin());
    const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
    puppeteer_extra_1.default.use(AdblockerPlugin());
    console.log('Launching puppeteer...');
    const browser = await puppeteer_extra_1.default.launch();
    console.log('Opening undergrad page...');
    const page = await browser.newPage();
    console.log('Going to url...');
    await page.goto(uGradUrl);
    console.log('Scraping programs...');
    const popup = await page.$('#sliding-popup');
    if (popup) {
        await page.evaluate((el) => el.remove(), popup);
    }
    const buttonSelector = 'xpath///li/div[not(contains(@name, "Education") or contains(@name, "Degree"))]/div/button';
    await page.waitForSelector(buttonSelector);
    const buttons = await page.$$(buttonSelector);
    for (const el of buttons) {
        await el.click();
    }
    const linkSelector = 'xpath///li/div/div/div/div/ul//a';
    await page.waitForSelector(linkSelector);
    const links = await page.$$(linkSelector);
    for (let i = 0; i < links.length; ++i) {
        const link = await page.evaluate((el) => el.href, links[i]);
        const programData = await scraper.scrapePrograms(fastify, browser, link);
        if (programData.name && programData.programSubtype && programData.urlCode) {
            const program = {
                name: programData.name,
                programSubtype: programData.programSubtype,
                urlCode: programData.urlCode
            };
            await db.insertPrograms(fastify, program);
            console.log(`Inserted ${i + 1} of ${links.length} programs...`);
        }
    }
}
exports.requestPrograms = requestPrograms;
async function requestCourses(fastify) {
    console.log('Calling course API...');
    const options = {
        method: 'GET',
        url: 'https://openapi.data.uwaterloo.ca/v3/Courses/1249',
        headers: {
            'x-api-key': process.env.UW_API_KEY_V3
        }
    };
    await axios_1.default.request(options).then(async function ({ data }) {
        let updatedCourses = 0;
        const uGradUrl = 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/courses';
        const stealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer_extra_1.default.use(stealthPlugin());
        const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
        puppeteer_extra_1.default.use(AdblockerPlugin());
        console.log('Launching puppeteer...');
        const browser = await puppeteer_extra_1.default.launch();
        console.log('Opening undergrad page...');
        const uGradPage = await browser.newPage();
        console.log('Going to url...');
        await uGradPage.goto(uGradUrl);
        console.log('Scraping courses...');
        for (let i = 0; i < data.length; ++i) {
            if (data[i].associatedAcademicCareer === 'UG') {
                if (data[i].subjectCode === 'MSCI')
                    data[i].subjectCode = 'MSE';
                if ((data[i].associatedAcademicGroupCode === 'REN' ||
                    data[i].associatedAcademicGroupCode === 'STJ' ||
                    data[i].associatedAcademicGroupCode === 'STP' ||
                    data[i].associatedAcademicGroupCode === 'CGC') &&
                    data[i].subjectCode !== 'BASE' &&
                    data[i].subjectCode !== 'EMLS' &&
                    data[i].subjectCode !== 'SWREN')
                    data[i].associatedAcademicGroupCode = 'ART';
                else if (data[i].associatedAcademicGroupCode === 'AHS')
                    data[i].associatedAcademicGroupCode = 'HEA';
                console.log(data[i].subjectCode + data[i].catalogNumber);
                const courseData = await scraper.scrapeCourse(fastify, browser, uGradPage, data[i].subjectCode, data[i].catalogNumber);
                if (courseData.units) {
                    const course = {
                        courseid: data[i].courseId,
                        title: data[i].title,
                        subjectcode: data[i].subjectCode,
                        catalogNumber: data[i].catalogNumber,
                        faculty: data[i].associatedAcademicGroupCode,
                        units: courseData.units,
                        component: data[i].courseComponentCode,
                        completions: courseData.completions,
                        simulEnroll: courseData.simulEnroll,
                        grading: data[i].gradingBasis,
                        description: data[i].description,
                        prerequisites: []
                    };
                    await db.insertCourses(fastify, course);
                    console.log(`Inserted ${i + 1} of ${data.length} programs...`);
                }
            }
        }
        await uGradPage.close();
        await browser.close();
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
        options.url += terms[i].code;
        await axios_1.default.request(options).then(async function ({ data }) {
            await db.createTermTable(fastify, termName);
            for (let i = 0; i < data.length; ++i) {
                await db.insertTermCourses(fastify, termName, data[i]);
            }
            console.log(termName);
        }).catch(function (error) {
            return 'Couldn\'t fetch class schedule data. Try again later?';
        });
    }
}
exports.requestTermCourseList = requestTermCourseList;
