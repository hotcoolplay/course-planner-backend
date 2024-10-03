var _a, _b, _c, _d;
import fp from "fastify-plugin";
import { fastifyPostgres } from "@fastify/postgres";
const dbUser = encodeURIComponent((_a = process.env.DB_ID) !== null && _a !== void 0 ? _a : "");
const dbPassword = encodeURIComponent((_b = process.env.DB_PWD) !== null && _b !== void 0 ? _b : "");
const dbHost = encodeURIComponent((_c = process.env.DB_HOST) !== null && _c !== void 0 ? _c : "");
const dbName = encodeURIComponent((_d = process.env.DB_NAME) !== null && _d !== void 0 ? _d : "");
async function dbConnector(fastify) {
    fastify.register(fastifyPostgres, {
        connectionString: `postgres://${dbUser}:${dbPassword}@${dbHost}/${dbName}`,
    });
}
export default fp(dbConnector);
