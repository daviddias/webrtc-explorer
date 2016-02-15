exports = module.exports = Explorer

function Explorer (options) {
  this.dial = () => {
    // successfully verify that a connection is establishable to the other peer
    // return a stream that will route messages
  }

  this.listen = () => {
    // connect and join (gen Id first), wait to be established, then go
    connect()
    join()
  }

  // connect to the sig-server
  function connect () {}

  // join the peerTable of the sig-server
  function join () {}

  // update a finger by asking the sig-server what is the new best
  this.updateFinger = (row) => {}

  // update every row to a new best
  this.updateFingerTable = () => {}
}
