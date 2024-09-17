import courseRoute from './components/courses/api.js'
import { requestCourses, requestTerms, requestTermCourseList, 
  requestPrograms, requestDegrees } from './libs/data-importer/requestData.js'

export let prerequisiteTexts = new Set(['This is a test'])

const server = require('fastify')({logger: true})

server.register(require('./libs/setup/envs'))
       .after(async function(err: any) {
          if (err) console.log(err);
          server.register(require('./libs/setup/db'))
          server.register(courseRoute)
})

server.addHook('preHandler', (req: any, res: any, done: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers",  "*");

  const isPreflight = /options/i.test(req.method);
  if (isPreflight) {
    return res.send();
  }
      
  done();
})

server.listen({ port: process.env.PORT }, (err: any, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
  const schedule = require('node-schedule')
  //schedule.scheduleJob('00 00 00 * *', async function(){
    //requestDegrees(server)
    requestPrograms(server)
    //requestCourses(server);
    //requestTerms(server);
    //requestTermCourseList(server);
  //});
})
