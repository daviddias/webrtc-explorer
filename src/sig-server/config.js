const debug = require('debug')
const log = debug('sig-server')
log.error = debug('sig-server:error')

module.exports = {
  log: log,
  hapi: {
    port: process.env.PORT || 9000,
    options: {
      connections: {
        routes: {
          cors: true
        }
      }
    }
  },
  explorer: {
    fingers: [
      0,
      10,
      12,
      20,
      30,
      47
    ],
    'min-peers': 4
  }
}
