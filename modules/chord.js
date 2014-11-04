var eventEmitter2 = require('eventemitter2').EventEmitter2;
var simplePeer = require('simple-peer');
var io = require('socket.io-client');
var bows = require('bows'); 
var fingerTable = require('./fingerTable').createFingerTable();
var uuid = require('./uuid.js');
var canela = require('canela');

log = bows('webrtc-chord');
// t;

exports = module.exports;


//
// config: {
//   signalingURL: <IP or Host of webrtc-chord-signaling-server>
//   namespace: defaults to /,
//   logging: defaults to true,
//   tracing: defaults to false // emit events for connect events and finger table changes
// }
// 
exports.createNode = function (config) {
  return new node(config);
};

function node(config) {
  localStorage.debug = config.logging || false;
  localStorage.trace = config.tracing || false;

  // t = config.tracing ? canela.createTracer({emitter: ee}) : canela.createTracer({active:false});

  var id = uuid.gen();                  // our node id
  // var fingers = fingerTable.create(id); // create our nitty finger table
  var entryPoint;                       // our entry point to the network
  var railing = {};                     // peers that we are railing
  var emitter = new eventEmitter2({ wildcard: true, newListener: false, maxListeners: 80 });


  //
  // Joining the Chord network through Signaling procedures
  //

  var url = (config.signalingURL || 'http://default.url') + (config.namespace || '/');
  var ioClient = io(url);
  ioClient.on('connect',    joinChord);
  ioClient.on('c-response', joinChordResponse);
  ioClient.on('c-request',  railNewPeer);

  function joinChord() {
    entryPoint = new simplePeer({ initiator: true, trickle: false });
    entryPoint.on('signal', function (data) {
      var invite = { id: id, signalData: data };
      ioClient.emit('s-request', invite);
      log('Sent Simple Peer data to another Peer');
    });
    entryPoint.on('message', interpreter);
  }

  function joinChordResponse (invite) {
    if (invite.peersAvailable === false) {
      log('There aren\'t other peers in the network currently');
      entryPoint = null;
    } else {
      log('Received signaling data from our RailingPeer');
      // had to move this here so I have access to the invite and so I know who I am pinging 
      entryPoint.on('ready', function() { 
        log('Connect to entryPoint, next connect to successor');   
        // END OF PHASE I
        // TODO: SEND MESSAGE TO CONNECT TO MY SUCESSOR
      });

      entryPoint.signal(invite.signalData);
    }
  }

  function railNewPeer (invite) {
    log('Received request to rail new peer on the network');
    var railer = new simplePeer({ trickle: false });
    railing[invite.id] = railer; // to be able to send messages back on interpreter and also close this connection specifically

    railer.on('signal', function (data) {   
      invite.signalData = data; // use the same invite object so the signaling server knows who to deliver
      invite.id = id;           // let the other node know what's my id
      ioClient.emit('s-response', invite);
      log('Sent Simple Peer data to the peer railing in');
    });

    railer.on('message', interpreter);
    railer.on('ready', function() { log('Ready to rail in the new peer'); });
    railer.signal(invite.signalData);
  }

  //
  // message interpreter/broker for the whole chord
  // note: ACTION AWARE instead of CONTEXT AWARE
  //

  function interpreter (message) {
    // here I have access to all of the things and can make decisions on top of that knowledge
    // {
    //   type:
    //   sourceID:
    //   destID:
    //   data:
    // }

    // first question, am I the destiny? If not forward
    // (fingerTable doesn't the math and we click send)

    // If yes:  what types of messages might be propagated and how to handle:
    // invite/connect to node
    // 
    // user - emit it to the user
  }




  //
  // webrtc-chord user interface only
  //

  // emmiter.emit('message-receive', {}); 
  // emitter.on('message-send', function (data) {

  // });

  return emitter;
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

