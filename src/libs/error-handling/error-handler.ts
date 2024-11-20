import { ServerError } from "./server-error.js";
import { FastifyInstance, FastifyRequest } from "fastify";

export function errorHandler(
  fastify: FastifyInstance | FastifyRequest,
  error: unknown,
): number {
  try {
    fastify.log.info("Attempting to handle error...");
    const serverError = convertErrorToServerError(error);
    fastify.log.error(serverError.message);
    fastify.log.error(serverError.stack);
    if (serverError.isFatal) process.exit(1);
    return serverError.HttpStatus;
  } catch (handlingError: unknown) {
    console.error("Couldn't handle error! Info to be displayed...");
    console.error(handlingError);
    console.error(error);
    return 500;
  }
}

export function convertErrorToServerError(error: unknown): ServerError {
  if (error instanceof ServerError) return error;
  const errorObject = error && typeof error == "object" ? error : {};
  const name =
    "name" in errorObject && typeof errorObject.name == "string"
      ? errorObject.name
      : "Unknown Error";
  const message =
    "message" in errorObject && typeof errorObject.message == "string"
      ? errorObject.message
      : "unknown";
  const code =
    "HTTPStatus" in errorObject && typeof errorObject.HTTPStatus == "number"
      ? errorObject.HTTPStatus
      : 500;
  const stack =
    "stack" in errorObject ? (errorObject.stack as string) : undefined;
  const isFatal = true;
  const serverError = new ServerError(name, message, code, isFatal);
  serverError.stack = stack;
  return serverError;
}
