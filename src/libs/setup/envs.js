import fp from "fastify-plugin";
import fe from "@fastify/env";
const setupOptions = {
    schema: {
        type: "object",
        required: [
            "HOST",
            "PORT",
            "DB_ID",
            "DB_PWD",
            "DB_HOST",
            "DB_NAME",
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET",
            "FRONTEND_URL",
            "NODE_ENV",
        ],
        properties: {
            HOST: {
                type: "string",
            },
            PORT: {
                type: "string",
            },
            DB_ID: {
                type: "string",
            },
            DB_PWD: {
                type: "string",
            },
            DB_HOST: {
                type: "string",
            },
            DB_NAME: {
                type: "string",
            },
            GOOGLE_CLIENT_ID: {
                type: "string",
            },
            GOOGLE_CLIENT_SECRET: {
                type: "string",
            },
            FRONTEND_URL: {
                type: "string",
            },
            NODE_ENV: {
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
