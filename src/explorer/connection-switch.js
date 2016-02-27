const stream = require('stream')
const Duplex = stream.Duplex
const router = require('./message-router')
const config = require('./config')
// const log = config.log
const peerId = config.peerId

exports = module.exports

var incConnCB = () => {}

const connections = {}
// list of connections, by connId, each conn is a duplex stream pair
// { connId: {
//   inc: duplex stream
//   out: duplex stream (pair of inc)
// }

exports.setIncConnCB = (func) => {
  incConnCB = func
}

exports.receiveMessage = (message) => {
  // message struct
  // {
  //   srcId:
  //   dstId:
  //   connId:
  //   leap:
  //   data:
  // }

  // check if message has indeed my Id
  //   if yes, check if there is already a conn
  //     if yes write to that conn (inc)
  //     if not, create a conn and call incConnCB and send a ACK back
  //   if not, send message back saying that Id doesn't exist

  if (message.dstId === peerId.toHex()) {
    if (connections[message.connId]) {
      connections[message.connId].inc.write(message.data)
    } else {
      console.log('received SYN:', message.data)
      const conn = createConn(message.srcId, message.dstId)
      incConnCB(conn)
    }
  } else {
    const reply = {
      srcId: peerId.toHex(),
      dstId: message.srcId,
      connId: message.connId,
      data: message.dstId + ' does not exist'
    }
    router.send(reply)
  }
}

exports.createConn = createConn
function createConn (srcId, dstId) {
  // create a duplex stream pair
  // out.on('data') encapsulate chunk with: connId, srcId, dstId and then router.send(message)
  //

  const connId = (~~(Math.random() * 1e9)).toString(36) + Date.now()
  const out = new Duplex()
  const inc = new Duplex()

  out.on('data', (data) => {
    const message = {
      connId: connId,
      data: data,
      srcId: srcId,
      dstId: dstId
    }
    router.send(message)
  })

  connections[connId] = {
    inc: inc,
    out: out
  }

  return connections[connId]
}
