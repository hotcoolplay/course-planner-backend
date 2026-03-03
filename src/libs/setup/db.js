import fp from "fastify-plugin";
import { fastifyPostgres } from "@fastify/postgres";
async function dbConnector(fastify) {
    const dbUser = encodeURIComponent(process.env.DB_PGUSER || "");
    const dbPassword = encodeURIComponent(process.env.DB_PGPASSWORD || "");
    const dbHost = encodeURIComponent(process.env.DB_PGHOST || "");
    const dbName = encodeURIComponent(process.env.DB_PGDATABASE || "");
    fastify.register(fastifyPostgres, {
        connectionString: `postgres://${dbUser}:${dbPassword}@${dbHost}/${dbName}`,
    });
}
export default fp(dbConnector);
