/* globals describe, it, before, after */

const pp = require('piri-piri')
// const Id = require('webrtc-explorer-peer-id')
const expect = require('chai').expect

describe('explorer', () => {
  var ppId0
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

  it('spawn first browser', (done) => {
    expect(Object.keys(pp.clients).length).to.equal(0)
    pp.browser.spawn('./tests/explorer/scripts/explorer-peer.js', 1, (err) => {
      // this only happens on the after, when browsers are told to exit
      expect(err).to.not.exist
    })
    setTimeout(() => {
      expect(Object.keys(pp.clients)[0]).to.exist
      ppId0 = Object.keys(pp.clients)[0]
      done()
    }, 500)
  })

  it('browser 0 - join (listen)', (done) => {
    pp.browser.send(ppId0, 'listen')
    setTimeout(() => {
      expect(pp.clients[ppId0].msgs.length).to.equal(1)
      const msg = pp.clients[ppId0].msgs.shift()
      expect(msg).to.equal('listening')
      done()
    }, 500)
  })

  it('spawn another browser', (done) => {
    expect(Object.keys(pp.clients).length).to.equal(1)
    pp.browser.spawn('./tests/explorer/scripts/explorer-peer.js', 1, (err) => {
      // this only happens on the after, when browsers are told to exit
      expect(err).to.not.exist
    })
    setTimeout(() => {
      expect(Object.keys(pp.clients)[1]).to.exist
      ppId1 = Object.keys(pp.clients)[1]
      done()
    }, 500)
  })

  it('browser 1 - join (listen)', function (done) {
    this.timeout(50000)
    pp.browser.send(ppId1, 'listen')
    setTimeout(() => {
      expect(pp.clients[ppId1].msgs.length).to.equal(1)
      var msg = pp.clients[ppId1].msgs.shift()
      setTimeout(() => {
        pp.browser.send(ppId1, 'get-finger-table')
        setTimeout(() => {
          expect(pp.clients[ppId1].msgs.length).to.equal(1)
          msg = pp.clients[ppId1].msgs.shift()
          expect(Object.keys(msg[0])[0]).to.equal('0')
          done()
        }, 200)
      }, 200)
    }, 500)
  })
})
