import listRoutes from "./components/lists/api/api.js";
import {
  //requestPrograms,
  requestCourses,
  //requestTerms,
  //requestTermCourseList,
  //requestDegrees,
} from "./data-importer/data-scraper.js";
//import schedule from 'node-schedule'
import cors from "@fastify/cors";
import envs from "./libs/setup/envs.js";
import db from "./libs/setup/db.js";
import fastify from "fastify";
import * as errorHandling from "./libs/error-handling/index.js";

const server = fastify({
  logger: true,
});

server.register(envs).after(async function (err) {
  if (err) {
    errorHandling.errorHandler(server, err);
  }
  server.register(db);
  server.register(listRoutes);
  server.register(cors, {
    origin: "*",
    methods: ["GET"],
  });
});

server.setErrorHandler(errorHandling.apiErrorHandler);

server.listen({ port: Number(process.env.PORT) }, (err, address: string) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
  //schedule.scheduleJob('00 00 00 * *', async function(){
  //requestDegrees(server)
  //requestPrograms(server);
  requestCourses(server);
  //requestTerms(server);
  //requestTermCourseList(server);
  //});
});
