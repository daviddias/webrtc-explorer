var eventEmitter2 = require('eventemitter2').EventEmitter2;
var simplePeer = require('simple-peer');
var io = require('socket.io-client');

var fingerTable = require('./modules/fingerTable').createFingerTable();
var uuid = require('./uuid');

exports = module.exports = createNode;

// config: {
//   signalingURL: <IP or Host of webrtc-chord-signaling-server>
//   namespace: defaults to /
// }
function createNode(config) {
  var ee = new eventEmitter2({
    wildcard: true,
    newListener: false, 
    maxListeners: 50
  });

  var url = (config.signalingURL || 'http://default.url') + (config.namespace || '/');
  var ioClient = io(url);
  var bootstrapPeer;

  ioClient.on('c-connection-established', function () {
    // create a simple-peer
    // ask to connect to another peer (which will present to us the successor)


  });  

  ioClient.on('c-connection-response', function () {
    // start the bootstraping process.
    // end of (phase I)
    // ask if my ID is ok 
    // ask to connect with my successor! :)
    // once connected to the sucessor, fill in the fingertable

  });

  ioClient.on('c-connection-request', function () {
    // some other peer looking to connect to us for bootstrap purposes
  

  });



  return ee;
}

function messageInterpreter (simplePeerObj) {
  // attach all the event listners and respective 
  // operations for each node in the fingerTable
}




// A node joining the network
// Contact Signaling Server 
// Ask to be presented to another node
  // If there is no other nodes, just wait
  // If there are other nodes
    // Establish the connection with that Node
    // Ask if the ID is being used, if not, connect to the Node which will be his successor
    // Figure out it's finger table
    // Send a probe to the ring saying that he exists now so they can update their finger table
    // When the Node that is going to be the predecessor notices that he has a new sucessor, that node will establish contact with this new node and tell him "I'm your predecessor" (this is for gracious exists, not sure if I will want this though)
// note: if something breaks in the railing process, just emit an error and say to try again


// When a node leavs
// 1. It's connecting nodes will receive a ondestroy event 
// 2. They will have to update the rows that node was present on the finger table

