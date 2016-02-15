var ee2 = require('eventemitter2').EventEmitter2
var io = require('socket.io-client')
var bows = require('bows')
var Id = require('dht-id')
var FingerTable = require('./finger-table.js')
var ChannelManager = require('./channel-manager.js')

log = bows('webrtc-explorer')

exports = module.exports = Peer

// config: {
//     signalingURL: <IP or Host of webrtc-ring-signaling-server>
//     logging: defaults to false,
// }
function Peer (config) {
  localStorage.debug = config.logging || false
  var self = this

  self.events = new ee2({
    wildcard: true,
    newListener: false,
    maxListeners: 20
  })

  var ioc = io(config.signalingURL + '/')

  ioc.once('connect', connected)
  ioc.on('c-finger-update', function (data) {
    if (!self.fingerTable) {
      log('DEBUG: got a finger-update before finger table was ready')
    }

    self.fingerTable.fingerUpdate(data)
  })

  ioc.on('c-predecessor', function (data) {
    if (!self.fingerTable) {
      log('DEBUG: got a predecessor before finger table was ready')
    }
    self.fingerTable.predecessorUpdate(data)
  })

  function connected () {
    log('socket.io connection established')
  }

  // / module api

  self.register = function () {
    ioc.once('c-registered', registered)

    function registered (data) {
      self.peerId = new Id(data.peerId)
      self.channelManager = new ChannelManager(self.peerId,
        ioc,
        router)
      self.fingerTable = new FingerTable(self.peerId,
        self.events,
        self.channelManager)
      self.events.emit('registered', {peerId: data.peerId})
    }

    ioc.emit('s-register', {})
  }

  self.send = function (dstId, data) {
    var envelope = {
      dstId: dstId,
      data: data
    }

    router(envelope)
  }

  // / message router

  function router (envelope) {
    var nextHop = self.fingerTable.bestCandidate(envelope.dstId)
    log('nextHop:', nextHop, envelope)
    if (nextHop === self.peerId.toHex()) {
      return self.events.emit('message', envelope)
    } else {
      self.fingerTable.channelTo(nextHop).send(envelope)
    }
  }

}
