var Id = require('dht-id')

exports = module.exports = FingerTable

function FingerTable (peerId, events, channelManager) {
  var self = this

  var predecessorId
  var table = {}
  // rowIndex: {fingerId: , channel:}

  self.predecessorUpdate = function (data) {
    predecessorId = data.predecessorId
  }

  self.fingerUpdate = function (data) {
    console.log('finger-update', data)
    // 1. Check if needs to perform a new connect or just update an entry on the table
    // 2. Connect if necessary
    // 3. Once connected, update the finger tableA

    if (table[data.rowIndex] &&
      table[data.rowIndex].fingerId === data.fingerId) {
      console.log('already had establish this channel with: ', data.fingerId)
      return
    }

    channelManager.connect(data.fingerId, function (err, channel) {
      if (err) {}
      console.log('finger table row update: ',
        data.rowIndex, data.fingerId)
      if (!table[data.rowIndex]) {
        table[data.rowIndex] = {}
      }
      if (table[data.rowIndex].channel) {
        table[data.rowIndex].channel.destroy()
      }
      table[data.rowIndex].fingerId = data.fingerId
      table[data.rowIndex].channel = channel
    })
  }

  self.bestCandidate = function (dstId) {
    // Identify the best candidate to send when sending to destId

    var responsible

    dstId = new Id(dstId).toDec()

    interval(new Id(predecessorId).toDec(), peerId.toDec())
      .some(function (interval) {
        if (isIn(interval, dstId)) {
          responsible = peerId.toHex()
          return true
        }
      })

    if (responsible) {
      return responsible
    }

    var lower = peerId

    Object.keys(table).some(function (rowIndex) {
      var upper = new Id(table[rowIndex].fingerId)

      interval(lower.toDec(), upper.toDec()).some(function (interval) {
        if (isIn(interval, dstId)) {
          responsible = upper.toHex()
          return true
        }
      })

      if (responsible) {
        return true
      }

      lower = upper
    })

    if (!responsible) { // if we don't know the best, send to best we can
      responsible = lower.toHex()
    }

    return responsible

    function interval (a, b) {
      if (b < a) {
        return [
          [a, new Id(Id.spin()).toDec()],
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
  }

  self.channelTo = function (fingerId) {
    var channel
    Object.keys(table).some(function (rowIndex) {
      if (table[rowIndex].fingerId === fingerId) {
        channel = table[rowIndex].channel
        return true
      }
    })
    return channel
  }
}
