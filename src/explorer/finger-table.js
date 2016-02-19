const config = require('./config')
const log = config.log
const channelManager = require('./channel')

exports = module.exports

// {row: {peerId: <>, channel: <>}}
const table = {}
exports.table = table

exports.updateFinger = function (io) {
  return (update) => {
    // console.log('received an update', update)
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

exports.nextHop = (dstId) => {
  // TODO
  // 1. return the next best hop
}
