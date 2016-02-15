/* globals describe, it, after */

const expect = require('chai').expect
const io = require('socket.io-client')

describe('handshake', () => {
  const options = {
    transports: ['websocket'],
    'force new connection': true
  }

  const url = 'http://localhost:9000'

  var c1
  var c2
  const c1Id = new Buffer('6bytes').toString('hex')
  const c2Id = new Buffer('48bits').toString('hex')

  after((done) => {
    c1.disconnect()
    c2.disconnect()

    done()
  })

  it('io connect', (done) => {
    var count = 0

    c1 = io.connect(url, options)
    c2 = io.connect(url, options)

    c1.on('connect', connected)
    c2.on('connect', connected)

    function connected () {
      if (++count === 2) {
        done()
      }
    }
  })

  it('2 peers join', (done) => {
    var count = 0

    c1.once('we-ready', completed)
    c2.once('we-ready', completed)

    c1.emit('ss-join', {
      peerId: c1Id
    })
    c2.emit('ss-join', {
      peerId: c2Id
    })

    function completed (err) {
      expect(err).to.not.exist

      if (++count === 2) {
        done()
      }
    }
  })

  it('perform pseudo WebRTC handshake', (done) => {
    const originalOffer = {
      srcId: c1Id,
      dstId: c2Id,
      intentId: '1234',
      webrtc: 'chicken'
    }
    c1.once('we-handshake', (offer) => {
      expect(offer.webrtc).to.equal('pineapple')
      done()
    })
    c2.once('we-handshake', (offer) => {
      expect(offer.webrtc).to.equal('chicken')
      offer.webrtc = 'pineapple'
      offer.answer = true
      c2.emit('ss-handshake', offer)
    })

    c1.emit('ss-handshake', originalOffer)
  })
})
