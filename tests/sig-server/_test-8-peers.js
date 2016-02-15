var Lab = require('lab')
var Code = require('code')
var lab = exports.lab = Lab.script()
var io = require('socket.io-client')
var spawn = require('child_process').spawn
var request = require('request')

var experiment = lab.experiment
var test = lab.test
var before = lab.before
var after = lab.after
var expect = Code.expect

experiment(':', function () {
  var server
  var c1Io
  var c2Io
  var c3Io
  var c4Io
  var c5Io
  var c6Io
  var c7Io
  var c8Io

  var c1Id
  var c2Id
  var c3Id
  var c4Id
  var c5Id
  var c6Id
  var c7Id
  var c8Id

  var c1FingerTable = {}
  var c2FingerTable = {}
  var c3FingerTable = {}
  var c4FingerTable = {}
  var c5FingerTable = {}
  var c6FingerTable = {}
  var c7FingerTable = {}
  var c8FingerTable = {}

  var ioOptions = {
    transports: ['websocket'],
    'force new connection': true
  }
  var url = 'http://localhost:9000'

  before(function (done) {
    server = spawn('node', ['./src/index.js'])
    server.stdout.on('data', function (data) {
      console.log('\n stdout: ' + data)
    })
    server.stderr.on('data', function (data) {
      console.log('\n stderr: ' + data)
    })
    setTimeout(function () { done(); }, 1000)
  })

  after(function (done) {
    c1Io.disconnect()
    c2Io.disconnect()
    c3Io.disconnect()
    c4Io.disconnect()
    c5Io.disconnect()
    c6Io.disconnect()
    c7Io.disconnect()
    c8Io.disconnect()

    setTimeout(function () {
      server.on('close', function (code) {
        console.log('exited: ' + code)
      })

      server.kill()
    }, 500)
  })

  test('connect 9 clients', function (done) {
    var count = 0
    c1Io = io.connect(url, ioOptions)
    c2Io = io.connect(url, ioOptions)
    c3Io = io.connect(url, ioOptions)
    c4Io = io.connect(url, ioOptions)
    c5Io = io.connect(url, ioOptions)
    c6Io = io.connect(url, ioOptions)
    c7Io = io.connect(url, ioOptions)
    c8Io = io.connect(url, ioOptions)

    c1Io.on('connect', connected)
    c2Io.on('connect', connected)
    c3Io.on('connect', connected)
    c4Io.on('connect', connected)
    c5Io.on('connect', connected)
    c6Io.on('connect', connected)
    c7Io.on('connect', connected)
    c8Io.on('connect', connected)

    function connected () {
      count += 1
      if (count === 8) {
        setTimeout(done, 1000)
      }
    }
  })

  test('register 8 peer peers', {timeout: 60 * 1000}, function (done) {
    c1Io.once('c-registered', function (data) {
      c1Id = data.peerId
      expect(c1Id).to.be.a.string()
    })
    c2Io.once('c-registered', function (data) {
      c2Id = data.peerId
      expect(c2Id).to.be.a.string()
    })
    c3Io.once('c-registered', function (data) {
      c3Id = data.peerId
      expect(c3Id).to.be.a.string()
    })
    c4Io.once('c-registered', function (data) {
      c4Id = data.peerId
      expect(c4Id).to.be.a.string()
    })
    c5Io.once('c-registered', function (data) {
      c5Id = data.peerId
      expect(c5Id).to.be.a.string()
    })
    c6Io.once('c-registered', function (data) {
      c6Id = data.peerId
      expect(c6Id).to.be.a.string()
    })
    c7Io.once('c-registered', function (data) {
      c7Id = data.peerId
      expect(c7Id).to.be.a.string()
    })
    c8Io.once('c-registered', function (data) {
      c8Id = data.peerId
      expect(c8Id).to.be.a.string()
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

    c3Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c3FingerTable[data.rowIndex] = data.fingerId
    })

    c4Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c4FingerTable[data.rowIndex] = data.fingerId
    })

    c5Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c5FingerTable[data.rowIndex] = data.fingerId
    })

    c6Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c6FingerTable[data.rowIndex] = data.fingerId
    })

    c7Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c7FingerTable[data.rowIndex] = data.fingerId
    })

    c8Io.on('c-finger-update', function (data) {
      expect(data.rowIndex).to.be.a.string()
      expect(data.fingerId).to.be.a.string()
      c8FingerTable[data.rowIndex] = data.fingerId
    })

    c1Io.emit('s-register', {})
    c2Io.emit('s-register', {})
    c3Io.emit('s-register', {})
    c4Io.emit('s-register', {})
    c5Io.emit('s-register', {})
    c6Io.emit('s-register', {})
    c7Io.emit('s-register', {})
    c8Io.emit('s-register', {})

    setTimeout(done, 5000)
  })

  test('verify if /dht matches', function (done) {
    request(url + '/dht', function (err, response, body) {
      var parsed = JSON.parse(body)

      expect(c1FingerTable['1'])
        .to.equal(parsed[c1Id].fingerTable['1'].current)
      expect(c1FingerTable['2'])
        .to.equal(parsed[c1Id].fingerTable['2'].current)
      expect(c1FingerTable['3'])
        .to.equal(parsed[c1Id].fingerTable['3'].current)
      expect(c1FingerTable['4'])
        .to.equal(parsed[c1Id].fingerTable['4'].current)

      expect(c2FingerTable['1'])
        .to.equal(parsed[c2Id].fingerTable['1'].current)
      expect(c2FingerTable['2'])
        .to.equal(parsed[c2Id].fingerTable['2'].current)
      expect(c2FingerTable['3'])
        .to.equal(parsed[c2Id].fingerTable['3'].current)
      expect(c2FingerTable['4'])
        .to.equal(parsed[c2Id].fingerTable['4'].current)

      expect(c3FingerTable['1'])
        .to.equal(parsed[c3Id].fingerTable['1'].current)
      expect(c3FingerTable['2'])
        .to.equal(parsed[c3Id].fingerTable['2'].current)
      expect(c3FingerTable['3'])
        .to.equal(parsed[c3Id].fingerTable['3'].current)
      expect(c3FingerTable['4'])
        .to.equal(parsed[c3Id].fingerTable['4'].current)

      expect(c4FingerTable['1'])
        .to.equal(parsed[c4Id].fingerTable['1'].current)
      expect(c4FingerTable['2'])
        .to.equal(parsed[c4Id].fingerTable['2'].current)
      expect(c4FingerTable['3'])
        .to.equal(parsed[c4Id].fingerTable['3'].current)
      expect(c4FingerTable['4'])
        .to.equal(parsed[c4Id].fingerTable['4'].current)

      expect(c5FingerTable['1'])
        .to.equal(parsed[c5Id].fingerTable['1'].current)
      expect(c5FingerTable['2'])
        .to.equal(parsed[c5Id].fingerTable['2'].current)
      expect(c5FingerTable['3'])
        .to.equal(parsed[c5Id].fingerTable['3'].current)
      expect(c5FingerTable['4'])
        .to.equal(parsed[c5Id].fingerTable['4'].current)

      expect(c6FingerTable['1'])
        .to.equal(parsed[c6Id].fingerTable['1'].current)
      expect(c6FingerTable['2'])
        .to.equal(parsed[c6Id].fingerTable['2'].current)
      expect(c6FingerTable['3'])
        .to.equal(parsed[c6Id].fingerTable['3'].current)
      expect(c6FingerTable['4'])
        .to.equal(parsed[c6Id].fingerTable['4'].current)

      expect(c7FingerTable['1'])
        .to.equal(parsed[c7Id].fingerTable['1'].current)
      expect(c7FingerTable['2'])
        .to.equal(parsed[c7Id].fingerTable['2'].current)
      expect(c7FingerTable['3'])
        .to.equal(parsed[c7Id].fingerTable['3'].current)
      expect(c7FingerTable['4'])
        .to.equal(parsed[c7Id].fingerTable['4'].current)

      expect(c8FingerTable['1'])
        .to.equal(parsed[c8Id].fingerTable['1'].current)
      expect(c8FingerTable['2'])
        .to.equal(parsed[c8Id].fingerTable['2'].current)
      expect(c8FingerTable['3'])
        .to.equal(parsed[c8Id].fingerTable['3'].current)
      expect(c8FingerTable['4'])
        .to.equal(parsed[c8Id].fingerTable['4'].current)
      done()
    })
  })
})
