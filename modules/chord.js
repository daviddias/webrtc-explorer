var eventEmitter2 = require('eventemitter2').EventEmitter2;
var simplePeer = require('simple-peer');
var io = require('socket.io-client');
var bows = require('bows'); 
var fingerTable = require('./fingerTable').createFingerTable();
var uuid = require('webrtc-chord-uuid');
var canela = require('canela');
var bigInt = require('big-integer');

log = bows('webrtc-chord');
// t; 

exports = module.exports;

//
// config: {
//   signalingURL: <IP or Host of webrtc-chord-signaling-server>
//   logging: defaults to true,
//   tracing: defaults to false // emit events for connect events and finger table changes
// }
// 
exports.createNode = function (config) {
  return new node(config);
};

function node(config) {
  localStorage.debug = config.logging || false;
  // t = canela.createTracer({emitter: ee, active: config.tracing || false});

  var id = uuid.gen();                  // our node id
  // var fingers = fingerTable.create(id); // create our nitty finger table
  var predecessor;
  var sucessor;                       
  var emitter = new eventEmitter2({ wildcard: true, newListener: false, maxListeners: 80 });

  /// Joining the Chord network through Signaling procedures

  var url = (config.signalingURL || 'http://default.url') + (config.namespace || '/');
  var ioClient = io(url);
  ioClient.on('connect', join);
  
  // warmup mode join
  ioClient.on('c-warmup-predecessor', acceptPredecessor);
  ioClient.on('c-warmup-sucessor', acceptSucessor);

  // normal mode join/rail new node
  ioClient.on('c-response', joinResponse);
  ioClient.on('c-predecessor', newPredecessor);
  ioClient.on('c-sucessor', newSucessor);

  /// bootstrap

  function join() {
    sucessor = new simplePeer({ initiator: true, trickle: false });
    predecessor = new simplePeer({ initiator: true, trickle: false });

    var signalData = {};

    sucessor.on('signal', function (data) { signalData.sucessor = data; });
    predecessor.on('signal', function (data) { signalData.predecessor = data; });

    sucessor.on('message', router);
    predecessor.on('message', router);

    sucessor.on('close', function (data) { log(data); });
    sucessor.on('error', function (data) { log(data); });
    sucessor.on('ready', function () { log('sucessor channel ready to start the party'); });
    predecessor.on('close', function (data) { log(data); });
    predecessor.on('error', function (data) { log(data); });
    predecessor.on('ready', function () { log('predecessor channel ready to start the party'); });
 
    function set() {
      if (Object.keys(signalData).length < 2) {
        return setTimeout(set,500);
      }
      ioClient.emit('s-join', {
        peerId: id,
        signalData: signalData
      });
    }
    set();
  }

  ///
  /// Warm up mode
  ///

  function acceptPredecessor(predecessorInvite) {
    // if this happens, means we are in warm up mode, so our initial predecessor won't work, because it was an initiatior
    predecessor = new simplePeer({ trickle: false });

    predecessor.on('message', router);
    predecessor.on('close', function (data) { log(data); });
    predecessor.on('error', function (data) { log(data); });
    predecessor.on('ready', function () { log('predecessor channel ready to start the party'); });

    predecessor.on('signal', function(data){
      ioClient.emit('s-join-next', {
        peerId: id,
        returnTo: predecessorInvite.peerId,
        signalData: data
      });
    });
    predecessor.signal(predecessorInvite.signalData);
  }

  function acceptSucessor(sucessorInvite) {
    sucessor.signal(sucessorInvite.signalData);
    emitter.emit('ready', {});
  }

  ///
  /// Normal mode
  ///

  function joinResponse(inviteReply) {
    predecessor.signal(inviteReply.signalData.predecessor);
    sucessor.signal(inviteReply.signalData.sucessor);
    emitter.emit('ready', {});
  }


  function newPredecessor(invite) {
    var nP = new simplePeer({ trickle: false });

    nP.on('message', router);
    nP.on('close', function (data) { log(data); });
    nP.on('error', function (data) { log(data); });
    nP.on('ready', function () { 
      predecessor = nP;
      log('new predecessor is ready to start the party'); 
    });

    nP.on('signal', function(data){
      ioClient.emit('s-response', {
        peerId: invite.peerId,
        signalData: { sucessor: data }
      });
    });
    nP.signal(invite.signalData.sucessor);
  }

  function newSucessor(invite) {
    var nS = new simplePeer({ trickle: false });
   
    nS.on('message', router);
    nS.on('close', function (data) { log(data); });
    nS.on('error', function (data) { log(data); });
    nS.on('ready', function () { 
      sucessor = nS;
      log('new successor channel is ready'); 
    });

    nS.on('signal', function(data){
      ioClient.emit('s-response', {
        peerId: invite.peerId,
        signalData: { predecessor: data }
      });
    });

    nS.signal(invite.signalData.predecessor);
  }

  ///
  /// Message interpreter/broker for the whole chord
  /// note: ACTION AWARE instead of CONTEXT AWARE
  ///

  function router (message) {
    // log('MESSAGE RECEIVED: ',  message);
    // sucessor.send('HERE GOES');

    if(bigInt(message.destId, 16).compare(bigInt(id, 16)) === 1){
      sucessor.send(message);
    } else {
      emitter.emit('message-receive', message);      
    }


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

  emitter.on('message-send', function (message) {
    log('SENDING MESSAGE');
    sucessor.send(message);
  });

  return emitter;
}
