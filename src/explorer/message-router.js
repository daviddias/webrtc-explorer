const fingerTable = require('./finger-table')
const Id = require('webrtc-explorer-peer-id')
const config = require('./config')
// const log = config.log
const peerId = config.peerId
const connSwitch = require('./connection-switch')

exports = module.exports

exports.route = (message) => {
  // message struct
  // {
  //   srcId:
  //   dstId:
  //   connId:
  //   leap:
  //   data:
  // }

  // 1. check if it is for me (by routing criteria or leap flag)
  //   if yes, connSwitch.receiveMessage
  //   if not, send
  message = JSON.parse(message)
  if (message.data.type === 'Buffer') {
    message.data = new Buffer(message.data.data)
  }
  const dstId = new Id(message.dstId)

  console.log('router: route -', message)

  if (message.leap || peerId.toDec() >= dstId.toDec()) {
    return connSwitch.receiveMessage(message)
  }

  send(message)
}

exports.send = send
function send (message) {
  // send message to best next hop
  // note: if the nextHop is on the other side of the loop, add leap flag

  const nextHopId = new Id(fingerTable.nextHop(message.dstId))
  console.log('next hop is:', nextHopId.toHex())
  if (nextHopId.toDec() < peerId.toDec()) {
    message.leap = true
  }

  var channel

  Object.keys(fingerTable.table).forEach((row) => {
    if (fingerTable.table[row].peerId === nextHopId.toHex()) {
      channel = fingerTable.table[row].channel
    }
  })

  console.log('router: send -', message)

  channel.send(JSON.stringify(message))
}
