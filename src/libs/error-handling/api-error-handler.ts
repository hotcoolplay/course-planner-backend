import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { convertErrorToServerError, errorHandler } from "./error-handler.js";

export function apiErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const serverError = convertErrorToServerError(error);
  serverError.isFatal = false;
  const response = errorHandler(request, serverError);
  reply.status(response).send({});
}
