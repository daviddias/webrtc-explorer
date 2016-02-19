const sigServer = require('./index')

sigServer.start(() => {
  console.log('Signalling Server Started')
})

process.on('SIGINT', () => {
  sigServer.stop(() => {
    console.log('Signalling Server Stopped')
    process.exit()
  })
})
