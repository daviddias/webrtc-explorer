const explorer = require('../src/explorer')

global.explorer = explorer

const listener = explorer.createListener((conn) => {
  console.log('received conn')
  conn.on('data', function (data) {
    console.log('received some data', data)
  })
})

listener.listen((err) => {
  if (err) {
    return console.log('Error listening:', err)
  }
  console.log('Listening')
})
