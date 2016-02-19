const explorer = require('../src/explorer')

const listener = explorer.createListener((conn) => {
  console.log('received conn')
})

listener.listen((err) => {
  if (err) {
    return console.log('Error listening:', err)
  }
  console.log('Listening')
})
