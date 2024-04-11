import courseRoute from './components/courses/api'

const server = require('fastify')({logger: true})

server.register(require('./libs/setup/envs'))
       .after((err: any) => {
          if (err) console.log(err);
          server.register(require('./libs/setup/db'))
          server.register(require('./libs/course-importer/client'))
})


server.listen({ port: 8080 }, (err: any, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
