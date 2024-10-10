import courseRoute from "./components/lists/api.js";
import { requestCourses, } from "./libs/data-importer/requestData.js";
//import schedule from 'node-schedule'
import envs from "./libs/setup/envs.js";
import db from "./libs/setup/db.js";
import fastify from "fastify";
export const prerequisiteTexts = new Set();
const server = fastify({
    logger: true,
});
server.register(envs).after(async function (err) {
    if (err)
        console.log(err);
    server.register(db);
    server.register(courseRoute);
});
server.addHook("preHandler", (req, res, done) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "*");
    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
        return res.send();
    }
    done();
});
server.listen({ port: Number(process.env.PORT) }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    //schedule.scheduleJob('00 00 00 * *', async function(){
    //requestDegrees(server)
    //requestPrograms(server);
    requestCourses(server);
    //requestTerms(server);
    //requestTermCourseList(server);
    //});
});
