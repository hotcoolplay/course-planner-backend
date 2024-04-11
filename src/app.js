"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server = require('fastify')({ logger: true });
server.register(require('./libs/setup/envs'))
    .after((err) => {
    if (err)
        console.log(err);
    server.register(require('./libs/setup/db'));
    server.register(require('./libs/course-importer/client'));
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
