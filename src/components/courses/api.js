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
Object.defineProperty(exports, "__esModule", { value: true });
const typebox_1 = require("@sinclair/typebox");
const course_schema_1 = require("./course-schema");
const domain = __importStar(require("./domain"));
async function courseRoute(fastify) {
    fastify.get('/courses', {
        schema: {
            response: Object.assign({ 200: course_schema_1.courseListSchema }, commonHTTPResponses),
        },
        handler: async (req, res) => {
            const result = await domain.getCourseList(fastify);
            if (!result) {
                res.status(404);
                return;
            }
            res.send(result);
        }
    });
    fastify.get('/course/:id', {
        schema: {
            response: Object.assign({ 200: course_schema_1.courseSchema }, commonHTTPResponses),
            params: typebox_1.Type.Object({
                id: typebox_1.Type.String()
            })
        },
        handler: async (req, res) => {
            const result = await domain.getCourse(fastify, req.params.id);
            if (!result) {
                res.status(404);
                return;
            }
            res.send(result);
        }
    });
}
exports.default = courseRoute;
const commonHTTPResponses = {
    400: {
        description: 'Bad request, please check your request body',
        type: 'null',
    },
    500: {
        description: 'Internal server error, please try again later',
        type: 'null',
    },
};
