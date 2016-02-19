exports = module.exports

exports.route = (message) => {
  // message struct
  // {
  //   srcId:
  //   dstId:
  //   connId:
  //   data:
  // }

  // TODO
  // 1. check if it is for me
  //   if yes, connSwitch.receiveMessage
  //   if not, send
}

exports.send = send
function send (message) {
  // TODO
  // send message to best next hop
}
