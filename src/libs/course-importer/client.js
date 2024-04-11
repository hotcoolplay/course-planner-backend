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
const axios_1 = __importDefault(require("axios"));
const parser_1 = __importDefault(require("./parser"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const options = {
    method: 'GET',
    url: 'https://openapi.data.uwaterloo.ca/v3/courses/1241',
    headers: {
        'x-api-key': process.env.UW_API_KEY_V3
    }
};
const updateCourses = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get('/update-courses', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        yield axios_1.default.request(options).then(function (_a) {
            return __awaiter(this, arguments, void 0, function* ({ data }) {
                yield (0, parser_1.default)(fastify, data);
                return reply.code(200);
            });
        }).catch(function (error) {
            console.error(error);
            return reply.send(500);
        });
    }));
});
exports.default = (0, fastify_plugin_1.default)(updateCourses);
