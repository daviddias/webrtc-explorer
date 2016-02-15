/* globals describe, it*/

const expect = require('chai').expect
const sigServer = require('../../src/sig-server')

describe('http routes', () => {
  it('/', (done) => {
    sigServer.http.inject({
      method: 'GET',
      url: '/'
    }, (res) => {
      expect(res.payload).to.equal('signaling server')
      done()
    })
  })
})
