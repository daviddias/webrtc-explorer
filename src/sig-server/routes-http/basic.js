const server = require('../').http

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply('signaling server')
  }
})
