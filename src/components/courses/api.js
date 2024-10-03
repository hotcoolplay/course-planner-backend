import { Type } from "@sinclair/typebox";
import { courseListSchema, courseSchema } from "./course-schema.js";
import * as domain from "./domain.js";
async function courseRoute(fastify) {
    fastify.get("/courselist", {
        schema: {
            response: Object.assign({ 200: courseListSchema }, commonHTTPResponses),
        },
        handler: async (req, res) => {
            const result = await domain.getCourseList(fastify);
            if (!result) {
                res.status(404);
                return;
            }
            res.send(result);
        },
    });
    fastify.get("/courses/course/:id", {
        schema: {
            response: Object.assign({ 200: courseSchema }, commonHTTPResponses),
            params: Type.Object({
                id: Type.String(),
            }),
        },
        handler: async (req, res) => {
            const result = await domain.getCourse(fastify, req.params.id);
            if (!result) {
                res.status(404);
                return;
            }
            res.send(result);
        },
    });
    fastify.get("/courses/term/:term", {
        schema: {
            response: Object.assign({ 200: courseListSchema }, commonHTTPResponses),
            params: Type.Object({
                term: Type.String(),
            }),
        },
        handler: async (req, res) => {
            const result = await domain.getCoursesByTerm(fastify, req.params.term);
            if (!result) {
                res.status(404);
                return;
            }
            res.send(result);
        },
    });
}
export default courseRoute;
const commonHTTPResponses = {
    400: {
        description: "Bad request, please check your request body",
        type: "null",
    },
    500: {
        description: "Internal server error, please try again later",
        type: "null",
    },
};
