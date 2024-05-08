import { FastifyInstance, FastifyBaseLogger } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { IncomingMessage, Server, ServerResponse } from 'node:http';

export type FastifyWithTypeProvider = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export interface Course {
    subjectcode: string,
    catalognumber: string,
    courseid: string
}

export interface Term {
    name: string,
    code: string
}
