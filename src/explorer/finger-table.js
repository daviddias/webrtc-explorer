const config = require('./config')
const log = config.log

exports = module.exports

exports.table = {}

exports.updateFinger = (update) => {
  console.log('received an update', update)
  log('received an update', update)
  // TODO
  // 1. establish a channel
  // 2. then update the table
}

exports.nextHop = (dstId) => {
  // TODO
  // 1. return the next best hop
}
