import fp from "fastify-plugin";
import fe from "@fastify/env";
const setupOptions = {
    schema: {
        type: "object",
        required: ["PORT", "DB_ID", "DB_PWD", "DB_NAME"],
        properties: {
            PORT: {
                type: "string",
                default: 3000,
            },
            DATABASE_USERNAME: {
                type: "string",
            },
            DATABASE_PASSWORD: {
                type: "string",
            },
            DATABASE_NAME: {
                type: "string",
            },
        },
    },
    dotenv: true,
};
async function envConnector(fastify) {
    fastify.register(fe, setupOptions);
}
export default fp(envConnector);
