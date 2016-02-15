const Id = require('webrtc-explorer-peer-id')

module.exports = (peerId, idealFingerId, currentFingerId, newFingerId) => {
  const p = peerId.toDec()
  const i = idealFingerId.toDec()
  const c = currentFingerId.toDec()
  const n = newFingerId.toDec()

  // does it leap
  if (i < p) {
    // is it on the left
    if (n <= new Id('ffffffffffff').toDec() && n > p && n > c) {
      return true
    }
    // is it on the right
    if (n > 0 && n < c) {
      return true
    }
  } else if (n >= i && n < c) {
    return true
  }
  return false
}
