import { Type } from "@sinclair/typebox";
import {
  courseListSchema,
  courseSchema,
  selectedCourseSchema,
} from "../domain/course-schema.js";
import * as domain from "../domain/retrieve-courses.js";
import { FastifyWithTypeProvider, commonHTTPResponses } from "../../index.js";

async function courseRoutes(fastify: FastifyWithTypeProvider) {
  fastify.get("/courses", {
    schema: {
      response: {
        200: courseListSchema,
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Course list was requested`);
      const result = await domain.getCourseList(fastify);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
  fastify.get("/courses/course/:courseid", {
    schema: {
      response: {
        200: courseSchema,
        ...commonHTTPResponses,
      },
      params: Type.Object({
        courseid: Type.String(),
      }),
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(
        `Course with courseid ${req.params.courseid} was requested`,
      );
      const result = await domain.getCourse(fastify, req.params.courseid);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
  fastify.get("/courses/selected-course/:id", {
    schema: {
      response: {
        200: selectedCourseSchema,
        ...commonHTTPResponses,
      },
      params: Type.Object({
        id: Type.Number(),
      }),
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Course with ID ${req.params.id} was selected`);
      const result = await domain.getSelectedCourse(fastify, req.params.id);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
  fastify.get("/courses/term/:term", {
    schema: {
      response: {
        200: courseListSchema,
        ...commonHTTPResponses,
      },
      params: Type.Object({
        term: Type.String(),
      }),
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Course list for term ${req.params.term} was requested`);
      const result = await domain.getCoursesByTerm(fastify, req.params.term);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
}

export default courseRoutes;
