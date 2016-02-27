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

  // TODO
  // check if message has indeed my Id
  //   if yes, check if there is already a conn
  //     if yes write to that conn (inc)
  //     if not, create a conn and call incConnCB
  //   if not, send message back saying that Id doesn't exist
}

exports.createConn = (srcId, dstId) => {
  // TODO
  // create a duplex stream pair
  // out.on('data') encapsulate chunk with: connId, srcId, dstId and then router.send(message)
  //
}
