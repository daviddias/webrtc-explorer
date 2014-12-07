var Peer = require('simple-peer');

exports = module.exports;

exports.create = function (id, io, router, finger) {
  return new Manager(id, io, router, finger);
};

function Manager(id, io, router, finger) {
  var self = this;

  /// establish a connection to another peer

  self.connect = function(destId) {
    log('connect');

    var intentId = (~~(Math.random() * 1e9)).toString(36) + Date.now();

    var peer = new Peer({initiator: true, trickle: false});
    
    peer.on('signal', function (signal) {
      // log('sendOffer');
      io.emit('s-send-offer', {
        intentId: intentId,
        srcId: id,
        destId: destId,
        signal: signal
      });     
    });

    var listener = io.on('c-offer-accepted', offerAccepted);

    function offerAccepted(offer) {
      // log('offerAccepted');
      if(offer.intentId !== intentId) { 
        log('not right intentId ', offer.intentId, intentId);
        return; 
      }
      // listener.destroy();

      peer.signal(offer.signal);

      peer.on('ready', function() {
        log('channel ready to send');
        peer.on('message', router);
        finger.set(offer.destId, peer, self);
      });
    }
  };

  /// accept offers from peers that want to connect

  io.on('c-accept-offer', function(offer) {
    // log('acceptOffer');    
    var peer = new Peer({trickle: false});
    
    peer.on('ready', function() { 
      log('channel ready to listen');
      peer.on('message', router);
    });
    peer.on('signal', function (signal){
      // log('sending back my signal data');
      offer.destId = id; // so the other peer knows what's my id
      offer.signal = signal;
      io.emit('s-offer-accepted', offer);
    });

    peer.signal(offer.signal);
  });

  /// connect to the new sucessor available

  io.on('c-new-sucessor-available', function(idSucessor) {
    log('new sucessor available - id: ', idSucessor);
    self.connect(idSucessor);
  });
}
