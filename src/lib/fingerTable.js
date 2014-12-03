var bigInt = require('big-integer');

exports = module.exports;

exports.create = function(id, cb) {
  return new FingerTable(id, cb);
};

function FingerTable (id, cb) {
  var self = this;
  var sucessor;
  var table = []; 

  self.add = function (id, peer, cManager) {
    var first = sucessor ? false : true;
    
    sucessor = {
      id: id,
      peer: peer
    };

    peer.on('close', function() {
      // connect to new sucessor
      cManager.connect((bigInt(id, 16).add(1)).toString(16));
    });

    if(first) { 
      return cb(); 
    }
  };

  self.get = function (id) {
    // returns best peer for that id
  };

  self.sucessor = function () {
    return sucessor;
  };

  self.table = function () {
    return {
      sucessor: sucessor.id
      // fingers..
    };
  };

  return this;
}
