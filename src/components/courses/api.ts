import { FastifyInstance, FastifyBaseLogger } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { courseListSchema, courseSchema } from './course-schema';
import { IncomingMessage, Server, ServerResponse } from 'node:http';
import * as domain from './domain'

async function courseRoute (fastify: FastifyWithTypeProvider) {
    fastify.get('/courses', {
        schema: {
            response: {
                200: courseListSchema,
                ...commonHTTPResponses,
            },
        },
        handler: async (req, res) => {
            const result = await domain.getCourseList()
            if (!result) {
                res.status(404)
                return
            }
            res.send(result)
        }
    })
    fastify.get('/course/:id', {
        schema: {
            response: {
                200: courseSchema,
                ...commonHTTPResponses,
            },
            params: Type.Object({
                id: Type.String()
            })
        },
        handler: async (req, res) => {
            const result = await domain.getCourse(req.params.id)
            if (!result) {
                res.status(404)
                return
            }
            res.send(result)
        }
    })
}

export default courseRoute;
export type FastifyWithTypeProvider = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;
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
