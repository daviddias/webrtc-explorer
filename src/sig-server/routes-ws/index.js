const config = require('../config')
const log = config.log
const peerTable = require('../resources/peer-table')
const http = require('../index').http
const SocketIO = require('socket.io')
const Id = require('webrtc-explorer-peer-id')
const idealFinger = require('../utils/ideal-finger')
const fingerBestFit = require('../utils/finger-best-fit')

const io = new SocketIO(http.listener)
io.on('connection', handle)

function handle (socket) {
  log('received inbound ws conn')

  socket.on('ss-join', join.bind(socket))
  socket.on('disconnect', remove.bind(socket)) // socket.io own event
  socket.on('ss-handshake', forward.bind(socket))
  socket.on('ss-update-finger', (request) => {
    updateFinger(request.peerId, request.row)
  })
}

// join this signaling server network
function join (options) {
  if (options.peerId.length !== 12) {
    return this.emit('we-ready', new Error('Unvalid peerId length, must be 48 bits, received: ' + options.peerId).toString())
  }

  if (peerTable[options.peerId]) {
    return this.emit('we-ready', new Error('peerId already exists').toString())
  }

  peerTable[options.peerId] = {
    socket: this,
    notify: typeof options.notify === 'boolean' && options.notify === true,
    fingers: options.fingers || {
      '0': {
        ideal: idealFinger(new Id(options.peerId), '0').toHex(),
        current: undefined
      }}
  }

  log('peer joined: ' + options.peerId)
  this.emit('we-ready')
  if (Object.keys(peerTable).length === 1) {
    return log('This was the first peer join, do nothing')
  }
  notify()
  if (peerTable[options.peerId].fingers['0'].current === undefined) {
    if (!peerTable[options.peerId].notify) {
      return
    }
    updateFinger(options.peerId, '0')
  }

  // notify if to other peers if this new Peer is a best finger for them
  function notify () {
    const newId = options.peerId
    const peerIds = Object.keys(peerTable)
    // check for all the peers
    // if same id skip
    // if notify === false skip
    // check the first finger that matches the criteria for ideal or next to ideal
    peerIds.forEach((peerId) => {
      if (newId === peerId) {
        return // skip ourselves
      }
      if (!peerTable[peerId].notify) {
        return // skip if it doesn't want to be notified of available peers
      }

      // if it had none, notify to get a successor
      if (peerTable[peerId].fingers['0'].current === undefined) {
        peerTable[peerId].fingers['0'].current = newId
        peerTable[peerId].socket.emit('we-update-finger', {
          row: '0',
          id: newId
        })
        return
      }

      const rows = Object.keys(peerTable[peerId].fingers)
      // find the first row that could use this finger
      rows.some((row) => {
        const finger = peerTable[peerId].fingers[row]
        const bestCandidate = fingerBestFit(
            new Id(peerId),
            new Id(finger.ideal),
            new Id(finger.current),
            new Id(newId))
        if (bestCandidate) {
          peerTable[peerId].fingers[row].current = newId
          peerTable[peerId].socket.emit('we-update-finger', {
            row: row,
            id: newId
          })
          return true
        }
      })
    })
  }
}

// finds the best new Finger for the peerId's row 'row')
function updateFinger (peerId, row) {
  var availablePeers = Object.keys(peerTable)
  availablePeers.splice(availablePeers.indexOf(peerId), 1)

  // if row hasn't been checked before
  if (!peerTable[peerId].fingers[row]) {
    peerTable[peerId].fingers[row] = {
      ideal: idealFinger(new Id(peerId), row).toHex(),
      current: undefined
    }
  }

  var best = availablePeers.shift()
  availablePeers.forEach((otherId) => {
    const isFBT = fingerBestFit(
        new Id(peerId),
        new Id(peerTable[peerId].fingers[row].ideal),
        new Id(best),
        new Id(otherId))
    if (isFBT) {
      best = otherId
    }
  })
  if (best === peerTable[peerId].fingers[row].current) {
    return // nevermind then
  }
  peerTable[peerId].fingers[row].current = best
  peerTable[peerId].socket.emit('we-update-finger', {
    row: row,
    id: best
  })
}

function remove () {
  Object.keys(peerTable).forEach((peerId) => {
    if (peerTable[peerId].socket.id === this.id) {
      delete peerTable[peerId]
      log('peer disconnected: ' + peerId)
    }
  })
}

// forward an WebRTC offer to another peer
function forward (offer) {
  if (offer.answer) {
    peerTable[offer.srcId].socket
      .emit('we-handshake', offer)
    return
  }
  peerTable[offer.dstId].socket
    .emit('we-handshake', offer)
}

/*
function handle (socket) {
  log('received incoming WebSockets conn')

  socket.on('s-register', registerPeer)
  socket.on('disconnect', peerRemove) // socket.io own event
  socket.on('s-send-offer', sendOffer)
  socket.on('s-offer-accepted', offerAccepted)

  function registerPeer () {
    console.log('registerPeer')
    var peerId = new Id()
    peers[peerId.toHex()] = {
      socketId: socket.id,
      fingerTable: {}
    }

    console.log('->', peers)

    sockets[socket.id] = socket

    socket.emit('c-registered', {peerId: peerId.toHex()})

    console.log('registered new peer: ', peerId.toHex())

    calculateIdealFingers(peerId)
    updateFingers()
  }

  function calculateIdealFingers (peerId) {
    var fingers = config.explorer.fingers
    var k = 1
    while (k <= fingers.length) {
      var ideal = (peerId.toDec() + Math.pow(2, fingers[k - 1])) %
      Math.pow(2, 48)
      peers[peerId.toHex()].fingerTable[k] = {
        ideal: new Id(ideal).toHex(),
        current: undefined
      }
      k++
    }
  }

  function updateFingers () {
    if (Object.keys(peers).length < 2) {
      return
    }

    var sortedPeersId = Object.keys(peers).sort(function (a, b) {
      var aId = new Id(a)
      var bId = new Id(b)
      if (aId.toDec() > bId.toDec()) {
        return 1
      }
      if (aId.toDec() < bId.toDec()) {
        return -1
      }
      if (aId.toDec() === bId.toDec()) {
        console.log('error - There should never two identical ids')
        process.exit(1)
      }
    })

    sortedPeersId.forEach(function (peerId) {
      // predecessor
      var predecessorId = predecessorTo(peerId, sortedPeersId)

      if (peers[peerId].predecessorId !== predecessorId) {
        sockets[peers[peerId].socketId].emit('c-predecessor', {
          predecessorId: predecessorId
        })

        peers[peerId].predecessorId = predecessorId
      }

      // sucessors

      Object.keys(peers[peerId].fingerTable).some(function (rowIndex) {
        var fingerId = sucessorTo(peers[peerId]
          .fingerTable[rowIndex]
          .ideal, sortedPeersId)

        if (peers[peerId].fingerTable[rowIndex].current !==
          fingerId) {
          peers[peerId].fingerTable[rowIndex].current = fingerId

          sockets[peers[peerId].socketId].emit('c-finger-update', {
            rowIndex: rowIndex,
            fingerId: fingerId
          })
        }

        if (Object.keys(peers).length < config.explorer['min-peers']) {
          return true // stops the loop, calculates only
        // for the first position (aka sucessor of the node
        }
      })
    })

    function sucessorTo (pretendedId, sortedIdList) {
      pretendedId = new Id(pretendedId).toDec()
      sortedIdList = sortedIdList.map(function (inHex) {
        return new Id(inHex).toDec()
      })

      var sucessorId
      sortedIdList.some(function (value, index) {
        if (pretendedId === value) {
          sucessorId = value
          return true
        }

        if (pretendedId < value) {
          sucessorId = value
          return true
        }

        if (index + 1 === sortedIdList.length) {
          sucessorId = sortedIdList[0]
          return true
        }
      })

      return new Id(sucessorId).toHex()
    }

    function predecessorTo (peerId, sortedIdList) {
      var index = sortedIdList.indexOf(peerId)

      var predecessorId

      if (index === 0) {
        predecessorId = sortedIdList[sortedIdList.length - 1]
      } else {
        predecessorId = sortedIdList[index - 1]
      }

      return new Id(predecessorId).toHex()
    }
  }

  function peerRemove () {
    Object.keys(peers).map(function (peerId) {
      if (peers[peerId].socketId === socket.id) {
        delete peers[peerId]
        delete sockets[socket.id]
        console.log('peer with Id: %s has disconnected', peerId)
      }
    })
  }

  // signalling mediation between two peers

  function sendOffer (data) {
    sockets[peers[data.offer.dstId].socketId]
      .emit('c-accept-offer', data)
  }

  function offerAccepted (data) {
    sockets[peers[data.offer.srcId].socketId]
      .emit('c-offer-accepted', data)
  }
}*/
