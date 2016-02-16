const SocketIO = require('socket.io-client')
const config = require('./config')
const log = config.log
const fingerTable = require('./finger-table')

var io

exports = module.exports = Explorer

function Explorer (options) {
  options = options || {}
  this.dial = () => {
    // successfully verify that a connection is establishable to the other peer
    // return a stream that will route messages
  }

  this.listen = (callback) => {
    // connect and join (gen Id first), wait to be established, then go
    connect(options.url || 'http://localhost:9000', (err) => {
      if (err) {}
      join(callback)
    })
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
      peerId: config.peerId.toString('hex')
    })
    io.on('we-update-finger', fingerTable.updateFinger)
    io.once('we-ready', callback)
  }

  // update a finger by asking the sig-server what is the new best
  this.updateFinger = (row) => {}

  // update every row to a new best
  this.updateFingerTable = () => {}
}
