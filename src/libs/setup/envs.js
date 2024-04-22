"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const fe = require('@fastify/env');
const uwapischema = {
    type: 'object',
    required: ['UW_API_KEY_V3'],
    properties: {
        API_KEY: {
            type: 'string'
        }
    }
};
const dbschema = {
    type: 'object',
    required: ['DB_PORT', 'DB_ID', 'DB_PWD', 'DB_NAME'],
    properties: {
        PORT: {
            type: 'string',
            default: 3000
        },
        DATABASE_USERNAME: {
            type: 'string'
        },
        DATABASE_PASSWORD: {
            type: 'string',
        },
        DATABASE_NAME: {
            type: 'string'
        }
    }
};
const dboptions = {
    schema: dbschema,
    dotenv: true
};
const uwapioptions = {
    schema: uwapischema,
    dotenv: true
};
async function envConnector(fastify) {
    fastify.register(fe, dboptions);
    fastify.register(fe, uwapioptions);
}
exports.default = (0, fastify_plugin_1.default)(envConnector);
