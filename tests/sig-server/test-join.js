/* globals describe, it, after */

const expect = require('chai').expect
const io = require('socket.io-client')

describe('join', () => {
  const options = {
    transports: ['websocket'],
    'force new connection': true
  }

  const url = 'http://localhost:9000'

  var c1
  var c2
  var c3

  after((done) => {
    c1.disconnect()
    c2.disconnect()
    c3.disconnect()

    done()
  })

  it('io connect', (done) => {
    var count = 0

    c1 = io.connect(url, options)
    c2 = io.connect(url, options)
    c3 = io.connect(url, options)

    c1.on('connect', connected)
    c2.on('connect', connected)
    c3.on('connect', connected)

    function connected () {
      if (++count === 3) {
        done()
      }
    }
  })

  it('join with notify off', (done) => {
    var count = 0

    c1.once('we-ready', completed)
    c2.once('we-ready', completed)

    c1.emit('ss-join', {
      peerId: new Buffer('6bytes').toString('hex'),
      notify: false
    })
    c2.emit('ss-join', {
      peerId: new Buffer('48bits').toString('hex'),
      notify: false
    })

    function completed (err) {
      expect(err).to.not.exist

      if (++count === 2) {
        done()
      }
    }
  })

  it('join with incorrect Id', (done) => {
    c3.once('we-ready', completed)

    c3.emit('ss-join', {
      peerId: new Buffer('incorrect').toString('hex'),
      notify: false
    })

    function completed (err) {
      expect(err).to.exist
      done()
    }
  })

  it('io disconnect and connect again', (done) => {
    var count = 0

    c1.disconnect()
    c2.disconnect()
    c3.disconnect()

    c1 = io.connect(url, options)
    c2 = io.connect(url, options)
    c3 = io.connect(url, options)

    c1.on('connect', connected)
    c2.on('connect', connected)
    c3.on('connect', connected)

    function connected () {
      if (++count === 3) {
        done()
      }
    }
  })

  it('2 join with notify on', (done) => {
    // join with 1 and 2, check that only after 2 joins, one gets the message to connect to it, this way we avoid double call collision

    const c1Id = new Buffer('6bytes').toString('hex')
    const c2Id = new Buffer('48bits').toString('hex')

    // console.log('c1', c1Id)
    // console.log('c2', c2Id)

    c1.once('we-update-finger', (update) => {
      expect(update.id).to.equal(c2Id)
      expect(update.row).to.equal('0')
      c2.removeListener('we-update-finger')
      done()
    })
    c2.on('we-update-finger', () => {
      throw new Error('should not happen')
    })

    c1.emit('ss-join', {
      peerId: c1Id,
      notify: true
    })

    c2.emit('ss-join', {
      peerId: c2Id
    })
  })

  it('3rd joins with notify on', (done) => {
    var count = 0

    const c3Id = new Buffer('abcdef').toString('hex')
    // console.log('c3', c3Id)

    c1.once('we-update-finger', receivedUpdate)
    c3.once('we-update-finger', receivedUpdate)

    c3.emit('ss-join', {
      peerId: c3Id,
      notify: true
    })

    function receivedUpdate (update) {
      expect(update).to.exist
      expect(update.id).to.exist
      expect(update.row).to.equal('0')

      if (++count === 2) {
        done()
      }
    }
  })
})
