var eventEmitter2 = require('eventemitter2').EventEmitter2;
var io = require('socket.io-client');
var bows = require('bows'); 
var uuid = require('webrtc-chord-uuid');
var bigInt = require('big-integer');
var finger = require('./finger');
var channelManager = require('./channelManager');

log = bows('webrtc-ring');

exports = module.exports;

// config: {
//   signalingURL: <IP or Host of webrtc-ring-signaling-server>
//   logging: defaults to false,
// }
exports.createNode = function (config) {
  return new Node(config);
};

function Node(config) {
  localStorage.debug = config.logging || false;
  var self = this;
  var id = uuid.gen(); // our node id
  var fManager;
  var cManager; 
  
  self.e = new eventEmitter2({
    wildcard: true,
    newListener: false,
    maxListeners: 80 
  });

  var url = (config.signalingURL || 'http://default.url') + (config.namespace || '/');
  var ioClient = io(url);

  ioClient.once('connect', onConnect);

  function onConnect() {
    log('Connected to Signaling Server');
    ioClient.emit('s-id', id);

    fManager = finger.create(id, nodeReady);
    cManager = channelManager.create(id, ioClient, router, fManager);
    cManager.connect((bigInt(id, 16).add(1)).toString(16));
  }

  function nodeReady() { 
    log('node is ready');
    self.e.emit('ready', {});
  }

  /// module api

  self.send = function(destId, data) {
    var message = {
      destId: destId,
      data: data
    };

    if (bigInt(destId, 16).lesser(bigInt(id, 16))) {
      message.destId = 'fffffffffffffffffffffffffffffffffffffffff';
      message.realDestId = destId;
    }

    fManager.sucessor().peer.send(message);
  };

  self.sendSucessor = function(data) {
    console.log('send to sucessor');
    self.send((bigInt(id, 16).add(1)).toString(16), data);
  };

  self.id = function() {
    return id;
  };

  self.sucessor = function() {
    return fManager.sucessor();
  };

  /// message router

// e3de01bb17fdfbb055b2f49abbdc19c40f574a51
// fffffffffffffffffffffffffffffffffffffffff

  function router(message) {
    // { destID: , data: }    
    log('message arrived', message);


    if(bigInt(message.destId, 16).greater(bigInt(id, 16))) {
      // If the difference between me and my sucessor is positive, means we 
      // are looping the ring
      if((bigInt(id, 16).minus(bigInt(fManager.sucessor().id, 16))).compare(0) === 1) {
        if (message.destId === 'fffffffffffffffffffffffffffffffffffffffff') {
          log('loop the loop with edge case');
          message.destId = message.realDestId;
        } else {
          log('loop the loop');
          message.destId = fManager.sucessor().id;          
        }
      }

      log('forwardwing message: ', message);
      fManager.sucessor().peer.send(message);
    } else {
      log('message for me: ', message);
      self.e.emit('message', message.data);
    }
  }
}
