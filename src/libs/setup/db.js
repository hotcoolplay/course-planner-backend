"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const dbUser = encodeURIComponent((_a = process.env.DB_ID) !== null && _a !== void 0 ? _a : "");
const dbPassword = encodeURIComponent((_b = process.env.DB_PWD) !== null && _b !== void 0 ? _b : "");
const dbHost = encodeURIComponent((_c = process.env.DB_HOST) !== null && _c !== void 0 ? _c : "");
const dbName = encodeURIComponent((_d = process.env.DB_NAME) !== null && _d !== void 0 ? _d : "");
async function dbConnector(fastify) {
    fastify.register(require('@fastify/postgres'), {
        connectionString: `postgres://${dbUser}:${dbPassword}@${dbHost}/${dbName}`
    });
}
exports.default = (0, fastify_plugin_1.default)(dbConnector);
