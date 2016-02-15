const Id = require('webrtc-explorer-peer-id')

module.exports = (peerId, row) => {
  const k = Number(row) + 1
  const ideal = (peerId.toDec() + Math.pow(2, k - 1)) % Math.pow(2, 48)
  return new Id(ideal)
}
