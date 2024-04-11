"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("@fastify/postgres"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const dbUser = encodeURIComponent((_a = process.env.DB_ID) !== null && _a !== void 0 ? _a : "");
const dbPassword = encodeURIComponent((_b = process.env.DB_PWD) !== null && _b !== void 0 ? _b : "");
const dbHost = encodeURIComponent((_c = process.env.DB_HOST) !== null && _c !== void 0 ? _c : "");
const dbName = encodeURIComponent((_d = process.env.DB_NAME) !== null && _d !== void 0 ? _d : "");
function dbConnector(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(postgres_1.default, {
            connectionString: `postgres://${dbUser}:${dbPassword}@${dbHost}/${dbName}`
        });
    });
}
exports.default = (0, fastify_plugin_1.default)(dbConnector);
