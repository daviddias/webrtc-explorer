// Goal: Require this module and get a event emitter
var uuid = require('./uuid'); 
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var simplePeer = require('simple-peer');
var io = require('socket.io-client');


exports = module.exports = canelaStart;

var peerTable = {}; // {peerID: "peer-server object"}

function canelaStart (options) {
  var canela = new EventEmitter2({
    wildcard: true,
    newListener: false, 
    maxListeners: 50
  });

  var peerID = uuid.gen();
  console.log('My ID: ', peerID);
  var ioClient = io(options.signalingURL || 'http://default.url');

  // ~~
  // io
  // ~~

  ioClient.on('peer-connection-established', connectionEstablished);
  // ioClient.on('peer-list-response',          peerListResponse);
  ioClient.on('peer-connect-request',        peerConnectRequest);
  ioClient.on('peer-connect-response',       peerConnectResponse);
  // ioClient.on('peer-not-dht-endpoint',       notDHTEndpoint);

  function connectionEstablished () {
    // 1. Regist this peer on namespace
    // 2. Ask for peer list to connect to them
    var peerCard = {
      peerID: peerID,
      namespace: options.namespace || 'default'
    };
    ioClient.emit('io-register-peer', peerCard);
    ioClient.emit('io-peer-list-request', {});
    console.log('Connection to the Signaling server established');
  }


  function peerListResponse (peers) {

    // 1. for each peer, create a simple-peer object and send signal data
    // 2. add the peer object to our table
    // later on use the 'ready' event to start the DHT math
    if (peers.length <= 1){
      return console.log('First peer to join');
    } else {
      console.log('peerList Received: \n ', peers);
    }
    peers.map(function (destPeerID) {
      if (destPeerID === peerID ) { 
        return console.log('Not connecting to myself'); // don't connect to myself
      }
      var peer = new simplePeer({ initiator: true, trickle: false });
      peerTable[destPeerID] = peer;
      
      peer.on('signal', function (data) {
        var peerInvite = {
          sourceID: peerID,
          destID: destPeerID,
          simplePeerSignal: data
        };
        console.log('Sending signaling data to: ', destPeerID);
        ioClient.emit('io-peer-connect-request', peerInvite);
      });
      
      peer.on('message', receiveMessage);
      
      peer.on('ready', function() {
        console.log('Connection established with peer with ID: ', destPeerID);
      });
      
      console.log('Connecting to peer with ID: ', destPeerID);
    });
  }

  function peerConnectRequest (peerInvite) {
    // if the peer is not own our list (meaning we didn't initiate)
      // 1. create our own peer for this other peer
      // 2. when our signaling data is ready, send it to the peer asking to connect
      // 3. register all the events for sending and receiving in our peer object
    // if the peer is in our list
      // 1. signal ourselves with other peer data
    // if (!peerTable[peerInvite.sourceID]) {
      console.log('Received connection request from peer with ID: ', peerInvite.sourceID);
      var peer = new simplePeer({trickle: false});
      peerTable[peerInvite.sourceID] = peer;
      
      peer.on('signal', function (data) {
        var newPeerInvite = {
          sourceID: peerID,
          destID: peerInvite.sourceID,
          simplePeerSignal: data
        };
        ioClient.emit('io-peer-connect-response', newPeerInvite);        
      });
      
      peer.on('message', receiveMessage);
      
      peer.on('ready', function(){
        console.log('Connection established with peer with ID: ', peerInvite.sourceID);
      });

      peer.signal(peerInvite.simplePeerSignal);
  }

  function peerConnectResponse (peerInvite) {
    console.log('Received reply on my invitation to connect');
    peerTable[peerInvite.sourceID].signal(peerInvite.simplePeerSignal);
  }

  function notDHTEndpoint () {
      // If I'm not a dht endpoint, I might as well disconnect from this server.
      // Later, if I need, I can reconnect
  }

  // ~~
  // simple-peer 
  // ~~

  function receiveMessage (data) {
    canela.emit('message-receive', data);
  }

  // ~~
  // canela 
  // ~~


  // For user to communicate with other peers
  canela.on('message-send', messageSend);


  function messageSend (message) {
    peerTable[message.destID].send(message);
  }

  return canela;
}


exports.peerList = function () {
  return Object.keys(peerTable);
};