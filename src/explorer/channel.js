const SimplePeer = require('simple-peer')
const config = require('./config')
const router = require('./message-router')

exports = module.exports

exports.connect = (io, dstId, callback) => {
  const intentId = (~~(Math.random() * 1e9)).toString(36) + Date.now()

  const channel = new SimplePeer({initiator: true, trickle: false})

  channel.on('signal', function (signal) {
    // console.log('send offer (src, dst):', config.peerId.toHex(), dstId)
    io.emit('ss-handshake', {
      intentId: intentId,
      srcId: config.peerId.toHex(),
      dstId: dstId,
      signal: signal
    })
  })

  io.on('we-handshake', (offer) => {
    if (offer.intentId !== intentId || !offer.answer) {
      return
    }
    // console.log('offer was accepted (src, dst):', config.peerId.toHex(), dstId)

    channel.on('connect', function () {
      // console.log('channel ready to send')
      channel.on('message', function () {
        console.log('DEBUG: this channel should be only used to send and not to receive')
      })
      callback(null, channel)
    })

    channel.signal(offer.signal)
  })
}

exports.accept = function (io) {
  return (offer) => {
    // accept incoming DataChannels request to connect
    // pipe the received messages on those sockets to the message router
    //
    // note: if it says it is an answer, ignore
    //
    if (offer.answer) { return }

    // console.log('received an offer (src, dst):', offer.srcId, offer.dstId)
    const channel = new SimplePeer({trickle: false})

    channel.on('connect', function () {
      // console.log('channel ready to listen')
      channel.on('message', router.route)
    })

    channel.on('signal', function (signal) {
      // log('sending back my signal data')
      offer.signal = signal
      offer.answer = true
      io.emit('ss-handshake', offer)
    })

    channel.signal(offer.signal)
  }
}
