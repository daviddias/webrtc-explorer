const explorer = require('./../../../src/explorer/index.js')
const ppc = require('piri-piri').client

module.exports = function (args) {
  ppc.handle('listen', () => {
    const listener = explorer.createListener((conn) => {
      console.log('received conn')
    })

    listener.listen((err) => {
      if (err) {
        return console.log('Error listening:', err)
      }
      ppc.send('listening')
    })
  })

  // only connect after registering all the handles
  ppc.connect((err, socket) => {
    if (err) {
      return console.log(err)
    }
    console.log('### connected to piri-piri')
  })
}
