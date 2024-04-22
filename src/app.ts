import courseRoute from './components/courses/api'

const parser = require('./libs/course-importer/parser')

const server = require('fastify')({logger: true})

server.register(require('./libs/setup/envs'))
       .after(async function(err: any) {
          if (err) console.log(err);
          server.register(require('./libs/setup/db'))
          server.register(parser)
          const schedule = require('node-schedule')
          schedule.scheduleJob('01 * * * *', function(){
            console.log('hi')
            parser.parseCourses();
          });
})

server.listen({ port: 8080 }, (err: any, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
