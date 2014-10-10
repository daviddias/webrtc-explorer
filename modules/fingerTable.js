exports = module.exports;

exports.createFingerTable = function () {
  this.sucessor = {};
  this.predecessor = {};
  this.rows = [];  // {start:, interval:, successor:}

  return this;
};

// find the best Node I know to be successor 
// (basically if the id is on the interval of X row, that is the one)
exports.findSucessor = function (fingerTable, id) {

};
