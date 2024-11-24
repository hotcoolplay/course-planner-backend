import { Type } from "@sinclair/typebox";
import {
  courseListSchema,
  courseSchema,
  selectedCourseSchema,
  majorListSchema,
  selectedMajorSchema,
} from "../domain/list-schema.js";
import * as domain from "../domain/list-retrieval.js";
import { FastifyWithTypeProvider } from "../../index.js";

async function listRoutes(fastify: FastifyWithTypeProvider) {
  fastify.get("/courses", {
    schema: {
      response: {
        200: courseListSchema,
        ...commonHTTPResponses,
      },
    },
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
  fastify.get("/majors", {
    schema: {
      response: {
        200: majorListSchema,
        ...commonHTTPResponses,
      },
    },
    handler: async (req, res) => {
      fastify.log.info(`Major list was requested`);
      const result = await domain.getMajors(fastify);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
  fastify.get("/majors/selected-major/:id", {
    schema: {
      response: {
        200: selectedMajorSchema,
        ...commonHTTPResponses,
      },
      params: Type.Object({
        id: Type.Number(),
      }),
    },
    handler: async (req, res) => {
      fastify.log.info(`Major with ID ${req.params.id} was requested`);
      const result = await domain.getSelectedMajor(fastify, req.params.id);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
}

export default listRoutes;

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
