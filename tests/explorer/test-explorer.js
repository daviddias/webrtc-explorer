/* globals describe, it, before, after */

const pp = require('piri-piri')
// const Id = require('webrtc-explorer-peer-id')
const expect = require('chai').expect

describe('explorer', () => {
  var ppId1

  before((done) => {
    pp.start((err) => {
      expect(err).to.not.exist
      done()
    })
  })

  after((done) => {
    Object.keys(pp.clients).forEach((id) => {
      pp.browser.send(id, 'exit')
    })
    done()
  })

  it('spawn one browser', (done) => {
    expect(Object.keys(pp.clients).length).to.equal(0)
    pp.browser.spawn('./tests/explorer/scripts/explorer-peer.js', 1, (err) => {
      // this only happens on the after, when browsers are told to exit
      expect(err).to.not.exist
    })
    setTimeout(() => {
      expect(Object.keys(pp.clients)[0]).to.exist
      ppId1 = Object.keys(pp.clients)[0]
      done()
      // pp.browser.send(id, 'exit')
    }, 1000)
  })

  it('browser 1 - connect to sig-server', (done) => {
    done()
  })

  it('such test', (done) => {
    done()
  })
})
