// var Explorer = require('./../../explorer/index.js')
const ppc = require('piri-piri').client

module.exports = function (args) {
  ppc.connect((err, socket) => {
    if (err) {
      return console.log(err)
    }
    socket.on('exit', ppc.exit)
  })
}
