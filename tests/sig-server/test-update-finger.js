/* globals describe, it, after */

const expect = require('chai').expect
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
  var c5
  const c1Id = new Buffer('48bits').toString('hex')
  const c2Id = new Buffer('6bytes').toString('hex')
  const c3Id = new Buffer('batata').toString('hex')
  const c4Id = new Buffer('cebola').toString('hex')

  // console.log('c1', c1Id)
  // console.log('c2', c2Id)
  // console.log('c3', c3Id)
  // console.log('c4', c4Id)

  after((done) => {
    c1.disconnect()
    c2.disconnect()
    c3.disconnect()
    c4.disconnect()
    c5.disconnect()

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

  it('join four', function (done) {
    this.timeout(50000)
    var count = 0

    c1.once('we-ready', tick)
    c2.once('we-ready', tick)
    c3.once('we-ready', tick)
    c4.once('we-ready', tick)

    c1.once('we-update-finger', (update) => {
      expect(update.row).to.equal('0')
      expect(update.id).to.equal(c2Id)
      tick()
    })
    c2.once('we-update-finger', (update) => {
      expect(update.row).to.equal('0')
      expect(update.id).to.equal(c1Id)
      tick()
      c2.once('we-update-finger', (update) => {
        expect(update.row).to.equal('0')
        expect(update.id).to.equal(c3Id)
        tick()
      })
    })
    c3.once('we-update-finger', (update) => {
      expect(update.row).to.equal('0')
      expect(update.id).to.equal(c1Id)
      tick()
      c3.once('we-update-finger', (update) => {
        expect(update.row).to.equal('0')
        expect(update.id).to.equal(c4Id)
        tick()
      })
    })
    c4.once('we-update-finger', (update) => {
      expect(update.row).to.equal('0')
      expect(update.id).to.equal(c1Id)
      tick()
    })

    function tick () {
      if (++count === 10) {
        done()
        // setTimeout(done, 800)
      }
    }

    c1.emit('ss-join', { peerId: c1Id, notify: true })
    c2.emit('ss-join', { peerId: c2Id, notify: true })
    c3.emit('ss-join', { peerId: c3Id, notify: true })
    c4.emit('ss-join', { peerId: c4Id, notify: true })
  })

  it('update-finger c1 row 2', (done) => {
    c1.once('we-update-finger', (update) => {
      expect(update.row).to.equal('2')
      done()
    })
    c1.emit('ss-update-finger', {peerId: c1Id, row: '2'})
  })

  it('update-finger c2 row 10', (done) => {
    c2.once('we-update-finger', (update) => {
      expect(update.row).to.equal('10')
      done()
    })
    c2.emit('ss-update-finger', {peerId: c2Id, row: '10'})
  })

  it('update-finger c3 row 25 and 30', (done) => {
    c3.once('we-update-finger', (update) => {
      expect(update.row).to.equal('25')
      c3.emit('ss-update-finger', {peerId: c3Id, row: '30'})
      c3.once('we-update-finger', (update) => {
        expect(update.row).to.equal('30')
        done()
      })
    })
    c3.emit('ss-update-finger', {peerId: c3Id, row: '25'})
  })

  it('join peer c5', (done) => {
    const c5Id = new Buffer('fifthe').toString('hex')
    // console.log(c5Id)
    c5 = io.connect(url, options)
    c5.on('connect', () => {
      c5.emit('ss-join', { peerId: c5Id, notify: true })
    })

    var count = 0

    c4.once('we-update-finger', tick)
    c5.once('we-update-finger', tick)

    function tick (update) {
      if (++count === 2) {
        done()
      }
    }
  })

  it.skip('make a test with even more versatility', (done) => {})
})
