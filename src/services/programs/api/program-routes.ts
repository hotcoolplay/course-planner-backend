import { Type } from "@sinclair/typebox";
import {
  majorListSchema,
  selectedMajorSchema,
  selectedProgramSchema,
  selectedProgramListSchema,
} from "../domain/program-schema.js";
import * as domain from "../domain/retrieve-programs.js";
import { FastifyWithTypeProvider, commonHTTPResponses } from "../../index.js";

async function programRoutes(fastify: FastifyWithTypeProvider) {
  fastify.get("/majors", {
    schema: {
      response: {
        200: majorListSchema,
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
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
  fastify.get("/extensions", {
    schema: {
      response: {
        200: selectedProgramListSchema,
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Common extension list was requested`);
      const result = await domain.getCommonExtensions(fastify);
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
    onRequest: [fastify.authenticate],
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
  fastify.get("/programs/selected-program/:id", {
    schema: {
      response: {
        200: selectedProgramSchema,
        ...commonHTTPResponses,
      },
      params: Type.Object({
        id: Type.Number(),
      }),
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Program with ID ${req.params.id} was requested`);
      const result = await domain.getSelectedProgram(fastify, req.params.id);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
}

export default programRoutes;
