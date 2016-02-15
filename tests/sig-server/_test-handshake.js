/* globals describe, it, before, after */

var io = require('socket.io-client')
var spawn = require('child_process').spawn

var expect = require('chai').expect

describe(':', function () {
  var server
  var c1Io
  var c2Io

  var c1Id
  var c2Id

  var c1FingerTable = {}
  var c2FingerTable = {}

  var ioOptions = {
    transports: ['websocket'],
    'force new connection': true
  }
  var url = 'http://localhost:9000'

  before(function (done) {
    server = spawn('node', ['./src/sig-server/index.js'])
    server.stdout.on('data', function (data) {
      console.log('\n stdout: ' + data)
    })
    server.stderr.on('data', function (data) {
      console.log('\n stderr: ' + data)
    })
    setTimeout(function () { done() }, 1000)
  })

  after(function (done) {
    c1Io.disconnect()
    c2Io.disconnect()

    setTimeout(function () {
      server.on('close', function (code) {
        console.log('exited: ' + code)
      })

      server.kill()
    }, 500)
  })

  it('connect 2 clients', function (done) {
    var count = 0
    c1Io = io.connect(url, ioOptions)
    c2Io = io.connect(url, ioOptions)

    c1Io.on('connect', connected)
    c2Io.on('connect', connected)

    function connected () {
      count += 1
      if (count === 2) {
        setTimeout(done, 1000)
      }
    }
  })

  it('register 2 peer peers', {timeout: 60 * 1000}, function (done) {
    c1Io.once('c-registered', function (data) {
      c1Id = data.peerId
      expect(c1Id).to.be.a.string()
    })

    c2Io.once('c-registered', function (data) {
      c2Id = data.peerId
      expect(c2Id).to.be.a.string()
    })

    c1Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c1FingerTable[data.rowIndex] = data.fingerId
    })

    c2Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c2FingerTable[data.rowIndex] = data.fingerId
    })

    c1Io.emit('s-register', {})
    c2Io.emit('s-register', {})

    setTimeout(done, 10000)
  })

  it.skip('send offer', function (done) {
    var offer = {
      srcId: c1Id,
      dstId: c2Id,
      signalData: 'some stuff'
    }
    c1Io.emit('s-send-offer', {offer: offer})
    c1Io.once('c-offer-accepted', function (data) {
      done()
    })

    c2Io.once('c-accept-offer', function (data) {
      data.offer.signalDataReturn = 'some more stuff'
      c2Io.emit('s-offer-accepted', data)
    })
  })
})
