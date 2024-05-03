import courseRoute from './components/courses/api'
import { requestCourses, requestTerms, requestTermCourseList } from './libs/course-importer/parser'

const server = require('fastify')({logger: true})

server.register(require('./libs/setup/envs'))
       .after(async function(err: any) {
          if (err) console.log(err);
          server.register(require('./libs/setup/db'))
          server.register(courseRoute)
})

server.listen({ port: process.env.PORT }, (err: any, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
  const schedule = require('node-schedule')
  schedule.scheduleJob('00 * * * *', async function(){
    await requestCourses(server);
    await requestTerms(server);
    await requestTermCourseList(server);
  });
})
