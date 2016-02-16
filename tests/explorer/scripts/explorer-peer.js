const Explorer = require('./../../../src/explorer/index.js')
const ppc = require('piri-piri').client

module.exports = function (args) {
  var exp = new Explorer()

  // ppc.handle('sum', (arr) => {
  //  var sum = Number(arr[0] + arr[1])
  //  ppc.send(sum)
  // })

  ppc.handle('listen', () => {
    exp.listen((err) => {
      if (err) {
        console.log(err)
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
