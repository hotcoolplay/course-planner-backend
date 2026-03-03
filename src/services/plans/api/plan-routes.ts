import { Type } from "@sinclair/typebox";
import {
  planSchemaDTO,
  planListSchema,
  planSchema,
  createPlanDTO,
} from "../domain/plan-schema.js";
import util from "node:util";
import * as domain from "../domain/plan.js";
import { FastifyWithTypeProvider, commonHTTPResponses } from "../../index.js";

async function planRoutes(fastify: FastifyWithTypeProvider) {
  fastify.get("/plans", {
    schema: {
      response: {
        200: planListSchema,
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Plan list requested by user ${req.userId}`);
      const result = await domain.getPlanList(fastify, req.userId!);
      if (!result) {
        res.status(404);
        return;
      }
      res.send(result);
    },
  });
  fastify.get("/plan/:id", {
    schema: {
      response: {
        200: planSchema,
        ...commonHTTPResponses,
      },
      params: Type.Object({
        id: Type.Number(),
      }),
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(`Plan of id ${req.params.id} requested by user`);
      const authorized = await domain.checkPlanAuthorization(
        fastify,
        req.params.id,
        req.userId!,
      );
      if (!authorized) {
        res.status(404);
      }
      const result = await domain.getPlan(fastify, req.params.id);
      res.send(result);
    },
  });
  fastify.post("/plan/", {
    schema: {
      body: createPlanDTO,
      response: {
        202: {
          description:
            "Successfully accepted plan, but might not be processing it",
          type: "null",
        },
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (req) => {
      fastify.log.info(
        `Plan API was called to add new plan ${util.inspect(req.body)}`,
      );
      const plan = { ...req.body, userId: req.userId! };
      const newPlanId = await domain.createUserPlan(fastify, plan);
      return newPlanId;
    },
  });
  fastify.delete("/plan/:id", {
    schema: {
      response: {
        204: Type.Number(),
        ...commonHTTPResponses,
      },
      params: Type.Object({
        id: Type.Number(),
      }),
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(
        `Plan of id ${req.params.id} was requested to be deleted by user`,
      );
      const authorized = await domain.checkPlanAuthorization(
        fastify,
        req.params.id,
        req.userId!,
      );
      if (!authorized) {
        res.status(404);
      }
      const planId = await domain.deletePlan(fastify, req.params.id);
      res.status(204).send(planId);
    },
  });
  fastify.put("/update-plan/", {
    schema: {
      body: planSchema,
      response: {
        202: {
          description:
            "Successfully accepted updated plan, but might not be processing it",
          type: "null",
        },
        ...commonHTTPResponses,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      fastify.log.info(
        `Plan API was called to update plan with ${util.inspect(req.body)}`,
      );
      const authorized = await domain.checkPlanAuthorization(
        fastify,
        req.body.id,
        req.userId!,
      );
      if (!authorized) {
        res.status(404);
      }
      const updatedPlanId = await domain.updateUserPlan(fastify, req.body);
      return updatedPlanId;
    },
  });
}

export default planRoutes;
