import fp from "fastify-plugin";
import fe from "@fastify/env";
const uwapischema = {
    type: "object",
    required: ["UW_API_KEY_V3"],
    properties: {
        API_KEY: {
            type: "string",
        },
    },
};
const dbschema = {
    type: "object",
    required: ["DB_PORT", "DB_ID", "DB_PWD", "DB_NAME"],
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
};
const dboptions = {
    schema: dbschema,
    dotenv: true,
};
const uwapioptions = {
    schema: uwapischema,
    dotenv: true,
};
async function envConnector(fastify) {
    fastify.register(fe, dboptions);
    fastify.register(fe, uwapioptions);
}
export default fp(envConnector);
