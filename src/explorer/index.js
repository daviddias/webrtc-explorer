const SocketIO = require('socket.io-client')
const config = require('./config')
const log = config.log
const fingerTable = require('./finger-table')
const router = require('./message-router.js')

var io

exports = module.exports

exports.dial = () => {
  // successfully verify that a connection is establishable to the other peer
  // return a stream that will route messages
}

exports.createListener = (options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  router.setIncConnCB(callback)

  return {
    listen: (callback) => {
      // connect and join (gen Id first), wait to be established, then go
      connect(options.url || 'http://localhost:9000', (err) => {
        if (err) {}
        join(callback)
      })
    }
  }
}

// update a finger by asking the sig-server what is the new best
exports.updateFinger = (row) => {
  // TODO
  // 1. send a request for a finger Update on a specific row
}

// update every row to a new best
exports.updateFingerTable = () => {
  // TODO
  // 1. send a request by each Finger Row that I'm already using
}

// connect to the sig-server
function connect (url, callback) {
  io = SocketIO.connect(url)
  io.on('connect', callback)
}

// join the peerTable of the sig-server
function join (callback) {
  log('connected to sig-server')
  io.emit('ss-join', {
    peerId: config.peerId.toHex(),
    notify: true
  })
  io.on('we-update-finger', fingerTable.updateFinger)
  io.once('we-ready', callback)
}
