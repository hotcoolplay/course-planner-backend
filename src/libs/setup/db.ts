import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const dbUser = encodeURIComponent(process.env.DB_ID ?? "");
const dbPassword = encodeURIComponent(process.env.DB_PWD ?? "");
const dbHost = encodeURIComponent(process.env.DB_HOST ?? "");
const dbName = encodeURIComponent(process.env.DB_NAME ?? "");
async function dbConnector (fastify: FastifyInstance) {
    fastify.register(require('@fastify/postgres'), {
      connectionString: `postgres://${dbUser}:${dbPassword}@${dbHost}/${dbName}`
    })
}

export default fp(dbConnector);
