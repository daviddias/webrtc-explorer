const config = require('./config')
const log = config.log

exports = module.exports

exports.table = {}

exports.updateFinger = (update) => {
  log('received an update', update)
}

exports.nextHop = () => {}
