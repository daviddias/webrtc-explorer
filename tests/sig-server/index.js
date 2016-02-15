/* globals describe, before, after */

const sigServer = require('../../src/sig-server')
const fs = require('fs')

describe('sig-server', () => {
  before((done) => {
    sigServer.start(done)
  })

  after((done) => {
    sigServer.stop(done)
  })

  const tests = fs.readdirSync(__dirname)
  tests.filter(file => {
    if (file !== 'index.js') { return true }
    return false
  }).forEach(file => {
    require('./' + file)
  })
})
