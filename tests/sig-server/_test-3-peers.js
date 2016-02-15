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

  var c1Id
  var c2Id
  var c3Id

  var c1FingerTable = {}
  var c2FingerTable = {}
  var c3FingerTable = {}

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

    setTimeout(function () {
      server.on('close', function (code) {
        console.log('exited: ' + code)
      })

      server.kill()
    }, 500)
  })

  test('connect 3 clients', function (done) {
    var count = 0
    c1Io = io.connect(url, ioOptions)
    c2Io = io.connect(url, ioOptions)
    c3Io = io.connect(url, ioOptions)

    c1Io.on('connect', connected)
    c2Io.on('connect', connected)
    c3Io.on('connect', connected)

    function connected () {
      count += 1
      if (count === 3) {
        done()
      }
    }
  })

  test('register 1st peer', {timeout: 60 * 1000}, function (done) {
    c1Io.once('c-registered', function (data) {
      c1Id = data.peerId
      expect(c1Id).to.be.a.string()
      done()
    })

    c1Io.emit('s-register', {})
  })

  test('register 2nd peer, verify sucessors', {timeout: 60 * 1000},
    function (done) {
      var count = 0

      c2Io.emit('s-register', {})
      c2Io.once('c-registered', function (data) {
        count += 1
        c2Id = data.peerId
      })

      c1Io.once('c-finger-update', function (data) {
        count += 1
        expect(data.rowIndex).to.be.a.string()
        expect(data.fingerId).to.be.a.string()
        c1FingerTable[data.rowIndex] = data.fingerId
      })

      c2Io.once('c-finger-update', function (data) {
        count += 1
        expect(data.rowIndex).to.be.a.string()
        expect(data.fingerId).to.be.a.string()
        c2FingerTable[data.rowIndex] = data.fingerId
      })

      function verify () {
        if (count === 3) {
          expect(c1FingerTable['1']).to.be.equal(c2Id)
          expect(c2FingerTable['1']).to.be.equal(c1Id)
          return done()
        }
        setTimeout(verify, 500)
      }
      verify()
    })

  test('register 3rd peer, verify sucessors', {timeout: 60 * 1000},
    function (done) {
      var count = 0

      c3Io.emit('s-register')
      c3Io.once('c-registered', function (data) {
        c3Id = data.peerId
      })

      c1Io.once('c-finger-update', function (data) {
        count += 1
        expect(data.rowIndex).to.be.a.string()
        expect(data.rowIndex).to.equal('1')
        expect(data.fingerId).to.be.a.string()
        c1FingerTable[data.rowIndex] = data.fingerId
      })

      c2Io.once('c-finger-update', function (data) {
        count += 1
        expect(data.rowIndex).to.be.a.string()
        expect(data.rowIndex).to.equal('1')
        expect(data.fingerId).to.be.a.string()
        c2FingerTable[data.rowIndex] = data.fingerId
      })

      c3Io.once('c-finger-update', function (data) {
        count += 1
        expect(data.rowIndex).to.be.a.string()
        expect(data.rowIndex).to.equal('1')
        expect(data.fingerId).to.be.a.string()
        c3FingerTable[data.rowIndex] = data.fingerId
      })

      function verify () {
        if (count === 2) {
          expect(c1FingerTable['1']).to.not.equal(c2FingerTable['1'])
          expect(c2FingerTable['1']).to.not.equal(c3FingerTable['1'])
          expect(c3FingerTable['1']).to.not.equal(c1FingerTable['1'])

          return done()
        }
        setTimeout(verify, 500)
      }
      verify()
    })

  test('verify if /dht matches', function (done) {
    request(url + '/dht', function (error, response, body) {
      var parsed = JSON.parse(body)
      expect(parsed[c1Id].fingerTable['1'].current)
        .to.be.equal(c1FingerTable['1'])
      expect(parsed[c2Id].fingerTable['1'].current)
        .to.be.equal(c2FingerTable['1'])
      expect(parsed[c3Id].fingerTable['1'].current)
        .to.be.equal(c3FingerTable['1'])

      done()
    })
  })

})
