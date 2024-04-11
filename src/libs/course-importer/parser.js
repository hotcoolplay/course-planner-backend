"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const insertdb_1 = __importDefault(require("./insertdb"));
function parseCourses(fastify, data) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < data.length; ++i) {
            const course = data[i];
            if (course.associatedAcademicCareer === 'UG') {
                yield (0, insertdb_1.default)(fastify, course);
            }
        }
    });
}
/* Potentially implement at a later time
function checkEligibility(reqs: string): boolean {
    const prereqs: string[] = reqs.includes('Prereq: ') ?
    reqs.split('Prereq:')[1].split('Coreq:')[0].split('Antireq:')[0].split(/[;.]/) : [''];
    for (let i = 0; i < prereqs.length; ++i) {
        const check: string = prereqs[i].toLowerCase();
        if (check.includes('not open to')) {
            if (check.includes('faculty of math')
                || check.includes('honours mathematics')
            || check.includes ('computer science')) {
                return false;
            }
        }
        if (check.includes('only')) {
            if (!check.includes('computer science')
                    && !check.includes('mathematics ')
                        && !check.includes('math ')
                            && !check.includes('co-op')
                                && !check.includes('coop')
                                    && !check.includes('honours students')
                                        && check != ' honours') {
                                    return false;
                                }
        }
        if (convertLevel.some(e => check.includes(' ' + e + ' ')
            && check != (' level at least ' + e)
            && check != (' level at least ' + e + ' honours')
            && !check.includes(' level at least ' + e + ' or')
            && !check.includes('or ' + e))) {
            if (!check.includes('computer science')
                && !check.includes('mathematics ')
                    && !check.includes('math ')
                        && !check.includes('honours students')) {
                        console.log(check);
                        return false;
                    }
        }
    }
    return true;
}

function checkHelper(check: string) {
    if (check.includes('not open to')) {
            if (check.includes('faculty of math')
                || check.includes('honours mathematics')
            || check.includes ('computer science')) {
                return false;
            }
        }
        if (check.includes('only')) {
            if (!check.includes('computer science')
                    && !check.includes('mathematics ')
                        && !check.includes('math ')
                            && !check.includes('co-op')
                                && !check.includes('coop')
                                    && !check.includes('honours students')
                                        && check != ' honours') {
                                    return false;
                                }
        }
        if (convertLevel.some(e => check.includes(' ' + e + ' ')
            && check != (' level at least ' + e)
            && check != (' level at least ' + e + ' honours')
            && !check.includes(' level at least ' + e + ' or')
            && !check.includes('or ' + e))) {
            if (!check.includes('computer science')
                && !check.includes('mathematics ')
                    && !check.includes('math ')
                        && !check.includes('honours students')) {
                        console.log(check);
                        return false;
                    }
        }
}*/
exports.default = parseCourses;
