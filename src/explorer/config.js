const Id = require('webrtc-explorer-peer-id')
const debug = require('debug')
const log = debug('explorer')
log.error = debug('explorer:error')

module.exports = {
  log: log,
  peerId: new Id()
}
