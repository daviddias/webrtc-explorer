exports = module.exports

var incConnCB = () => {}
const incConns = {}

exports.setIncConnCB = (func) => {
  incConnCB = func
}

exports.routeMessage = (message) => {
  // TODO
  // 1. check if it is for me
  // 2. if not, route to best hop
}
