/* globals describe, before, after */

const sigServer = require('../../src/sig-server')

describe('sig-server', () => {
  before((done) => {
    sigServer.start(done)
  })

  after((done) => {
    sigServer.stop(done)
  })

  require('./test-http')
  require('./test-join')
  require('./test-finger-best-fit')
  require('./test-update-finger')

  // require('./test-send-offer')
  // require('./test-3-peers')
  // require('./test-8-peers')
})
