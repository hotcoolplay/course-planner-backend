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
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
function insertCourses(fastify, course) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Inserting ${course.subjectCode} ${course.catalogNumber}...`);
        fastify.pg.query('INSERT INTO courses(subject, catalognumber, courseid) VALUES($1, $2, $3) ON CONFLICT (courseid) DO NOTHING', [course.subjectCode, course.catalogNumber, course.courseId], function onResult(err, result) {
            if (err)
                console.error(err);
            else
                console.log(result);
        });
    });
}
exports.default = (0, fastify_plugin_1.default)(insertCourses);
