var bigInt = require('big-integer');

exports = module.exports;

exports.create = function(id, cb) {
  return new Finger(id, cb);
};

function Finger (id, cb) {
  var self = this;
  var sucessor;

  self.set = function (id, peer, cManager) {
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

  self.sucessor = function () {
    return sucessor;
  };

  return this;
}
