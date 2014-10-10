exports = module.exports;

exports.createPeerCard = function (peerID, simplePeerObj) {
  this.peerID = peerID || '';
  this.peer = simplePeerObj || {};
  return this;
};