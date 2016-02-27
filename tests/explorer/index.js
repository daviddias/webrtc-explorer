/* globals describe, before, after */

const sigServer = require('../../src/sig-server')
const fs = require('fs')

describe('explorer', () => {
  before((done) => {
    sigServer.start(done)
  })

  after((done) => {
    sigServer.stop(done)
  })

  const tests = fs.readdirSync(__dirname)
  tests.filter((file) => {
    if (file === 'index.js' || file === 'scripts') { return false }
    return true
  }).forEach((file) => {
    require('./' + file)
  })
})
