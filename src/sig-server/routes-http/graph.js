const server = require('../').http
const peerTable = require('../resources/peer-table')

server.route({
  method: 'get',
  path: '/dht',
  handler: function (request, reply) {
    reply(peerTable)
  }
})

