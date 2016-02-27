const config = require('./config')
const log = config.log
const channelManager = require('./channel')
const Id = require('webrtc-explorer-peer-id')

exports = module.exports

// {row: {peerId: <>, channel: <>}}
const table = {}
exports.table = table

var predecessorId

exports.updateFinger = function (io) {
  return (update) => {
    console.log('received an update', update)
    log('received an update finger', update)
    if (table[update.row] && table[update.row].peerId === update.id) {
      return console.log('update is not new')
    }

    channelManager.connect(io, update.id, (err, channel) => {
      if (err) {
        return console.log('could not create the channel', err)
      }
      console.log(update.id, 'added to finger table on row:', update.row)
      table[update.row] = {peerId: update.id, channel: channel}
    })
  }
}

exports.updatePredecessor = function (io) {
  return (pId) => {
    predecessorId = pId
  }
}

exports.forMe = (dstId) => {
  var forMe = false

  dstId = new Id(dstId).toDec()

  interval(new Id(predecessorId).toDec(), config.peerId.toDec())
    .some((interval) => {
      if (isIn(interval, dstId)) {
        forMe = true
        return true
      }
    })

  return forMe
}

// Identify the best candidate to send when sending to destId
exports.nextHop = (dstId) => {
  if (typeof dstId === 'object') {
    dstId = dstId.toDec()
  } else {
    dstId = new Id(dstId).toDec()
  }
  var lower = config.peerId
  var next

  const fingers = Object.keys(table)
  if (fingers.length === 1) {
    return table['0'].peerId
  }

  fingers.some((row) => {
    const upper = new Id(table[row].fingerId)

    interval(lower.toDec(), upper.toDec())
      .some((interval) => {
        if (isIn(interval, dstId)) {
          next = upper.toHex()
          return true
        }
      })

    // if found
    if (next) { return true }
    lower = upper
  })

  if (!next) { // if we don't know the best, send to best we can
    next = lower.toHex()
  }

  return next
}

function interval (a, b) {
  const SPIN = '1000000000000'
  if (b < a) {
    return [
      [a, new Id(SPIN).toDec()],
      [0, b]
    ]
  } else {
    return [[a, b]]
  }
}

function isIn (interval, dstId) {
  if (dstId > interval[0] && dstId <= interval[1]) {
    return true
  } else {
    return false
  }
}
