const SocketIO = require('socket.io-client')
const config = require('./config')
const log = config.log
const fingerTable = require('./finger-table')
const connSwitch = require('./connection-switch')
const channel = require('./channel')

console.log('My peerId:', config.peerId.toHex())

var io

exports = module.exports

exports.dial = (dstId, callback) => {
  // TODO
  // create a duplex stream
  // create a conn
  // write a SYN to conn.out
  // when a ACK arrives
  //   conn.inc.pipe(ds)
  //   ds.pipe(conn.out)
  //   callback(to signal that it is ready)
}

exports.createListener = (options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  connSwitch.setIncConnCB(callback)

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

exports.getFingerTable = () => {
  return fingerTable.table
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
  io.on('we-update-finger', fingerTable.updateFinger(io))
  io.on('we-handshake', channel.accept(io))

  io.once('we-ready', callback)
}
