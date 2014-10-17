var eventEmitter2 = require('eventemitter2').EventEmitter2;
var simplePeer = require('simple-peer');
var io = require('socket.io-client');
var bows = require('bows'); 
var fingerTable = require('./modules/fingerTable').createFingerTable();
var uuid = require('./modules/uuid.js');

log = bows('webrtc-chord');

exports = module.exports;

//
// config: {
//   signalingURL: <IP or Host of webrtc-chord-signaling-server>
//   namespace: defaults to /,
//   logging: defaults to true,
//   traces: defaults to false // emit events for connect events and finger table changes
// }
// 
exports.createNode = function (config) {
  localStorage.debug = config.logging || true;

  var ee = new eventEmitter2({
    wildcard: true,
    newListener: false, 
    maxListeners: 50
  });

  var url = (config.signalingURL || 'http://default.url') + (config.namespace || '/');
  var ioClient = io(url);
  var bootstrapPeer;

  ioClient.on('connect',    startBootstrapProcess);
  ioClient.on('c-response', receivedResponse);
  ioClient.on('c-request',  railNewPeer);

  function startBootstrapProcess() {
    bootstrapPeer = new simplePeer({ initiator: true, trickle: false });
  
    bootstrapPeer.on('signal', function (data) {        
      var peerInvite = { signalData: data };
      ioClient.emit('s-request', peerInvite);
      log('Sent Simple Peer data to another Peer');
    });
    
    bootstrapPeer.on('message', function (data) {
      // Take care here of the messages that will enable us to reach yo our sucessor
      // TODO LOT OF WORK
    });
    
    bootstrapPeer.on('ready', function() {
      log('Connected to the network... filling finger table');   
      // END OF PHASE I

      // ask if my ID is ok 
      // ask to connect with my successor! :)
      // once connected to the sucessor, fill in the fingertable
    });


  }

  function receivedResponse (peerInvite) {
    if (peerInvite.peersAvailable === false) {
      log('There aren\'t other peers in the network currently');
      bootstrapPeer = null;
      // bootstrapPeer.destroy(); // would only destroy if it there was a connection
      // setTimeout(function () { startBootstrapProcess(); }, 5000);
      // this way both peers start trying to connect forever, the first shouldn't
    } else {
      log('Received signaling data from our RailingPeer');
      bootstrapPeer.signal(peerInvite.signalData);      
    }
  }

  function railNewPeer (peerInvite) {
    log('Received request to rail new peer on the network');
    var railer = new simplePeer({ trickle: false });

    railer.on('signal', function (data) {   
      peerInvite.signalData = data; // peerInvite will also have the id of the node to get back
      
      ioClient.emit('s-response', peerInvite);
      log('Sent Simple Peer data to the peer railing in');
    });

    railer.on('message', function (data) {
      // Here we will handle the messages that will rail in this new peer
      // TODO LOT OF WORK
    });
    
    railer.on('ready', function() {
      log('Ready to rail in the new peer');   
    });

    railer.signal(peerInvite.signalData);


  }

  return ee;
};








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

