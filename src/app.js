"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prerequisiteTexts = void 0;
const api_js_1 = __importDefault(require("./components/courses/api.js"));
const requestData_js_1 = require("./libs/data-importer/requestData.js");
exports.prerequisiteTexts = new Set(['This is a test']);
const server = require('fastify')({ logger: true });
server.register(require('./libs/setup/envs'))
    .after(async function (err) {
    if (err)
        console.log(err);
    server.register(require('./libs/setup/db'));
    server.register(api_js_1.default);
});
server.addHook('preHandler', (req, res, done) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "*");
    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
        return res.send();
    }
    done();
});
server.listen({ port: process.env.PORT }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    const schedule = require('node-schedule');
    //schedule.scheduleJob('00 00 00 * *', async function(){
    //requestDegrees(server)
    (0, requestData_js_1.requestPrograms)(server);
    //requestCourses(server);
    //requestTerms(server);
    //requestTermCourseList(server);
    //});
});
