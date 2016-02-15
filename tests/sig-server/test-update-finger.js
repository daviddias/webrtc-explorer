/* globals describe, it, after */

// const expect = require('chai').expect
const io = require('socket.io-client')

describe('update-finger', () => {
  const options = {
    transports: ['websocket'],
    'force new connection': true
  }

  const url = 'http://localhost:9000'

  var c1
  var c2
  var c3
  var c4

  after((done) => {
    c1.disconnect()
    c2.disconnect()
    c3.disconnect()
    c4.disconnect()

    done()
  })

  it('io connect', (done) => {
    var count = 0

    c1 = io.connect(url, options)
    c2 = io.connect(url, options)
    c3 = io.connect(url, options)
    c4 = io.connect(url, options)

    c1.on('connect', connected)
    c2.on('connect', connected)
    c3.on('connect', connected)
    c4.on('connect', connected)

    function connected () {
      if (++count === 4) {
        done()
      }
    }
  })

  it('join four', (done) => {
    var count = 0
    const c1Id = new Buffer('6bytes').toString('hex')
    const c2Id = new Buffer('48bits').toString('hex')
    const c3Id = new Buffer('batata').toString('hex')
    const c4Id = new Buffer('banana').toString('hex')

    // console.log('c1', c1Id)
    // console.log('c2', c2Id)
    // console.log('c3', c3Id)
    // console.log('c4', c4Id)

    c1.once('we-ready', ready)
    c2.once('we-ready', ready)
    c3.once('we-ready', ready)
    c4.once('we-ready', ready)

    function ready () {
      if (++count === 4) {
        setTimeout(done, 800)
      }
    }

    c1.emit('ss-join', { peerId: c1Id })
    c2.emit('ss-join', { peerId: c2Id })
    c3.emit('ss-join', { peerId: c3Id })
    c4.emit('ss-join', { peerId: c4Id })
  })

  it.skip('update-finger c1 row 2', (done) => {
  })

  it.skip('update-finger c2 row 10', (done) => {
  })

  it.skip('update-finger c3 row 25', (done) => {
  })

  it.skip('update-finger c4 row 47', (done) => {
  })
})
