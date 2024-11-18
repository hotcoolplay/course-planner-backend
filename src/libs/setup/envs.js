import fp from "fastify-plugin";
import fe from "@fastify/env";
const setupOptions = {
    schema: {
        type: "object",
        required: ["DB_PORT", "DB_ID", "DB_PWD", "DB_NAME", "UW_API_KEY_V3"],
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
            API_KEY: {
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
