exports = module.exports

var incConnCB = () => {}
const connections = {}

exports.setIncConnCB = (func) => {
  incConnCB = func
}

exports.route = (message) => {
  // message struct
  // {
  //   srcId:
  //   dstId:
  //   connId:
  //   data:
  // }
  //
  // TODO
  // 1. check if it is for me (and if it has my Id, if not, reply back that peer doesn't exist)
  //   check if a conn was already open with that connId
  //     if not open one
  //       prepare that duplex stream to send messages too
  //     if yes write to that con
  // 2. if not, route to best hop
}

exports.send = send
function send (message)  {}
