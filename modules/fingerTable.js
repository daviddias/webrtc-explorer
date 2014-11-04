exports = module.exports;

exports.createFingerTable = function() {
  return new fingerTable();
};

function fingerTable () {
  var table = {};

  return this;
}


// this will be the math for the finger table and the table with start, interval and a reference to the sucessor




// exports = module.exports;

// exports.createFingerTable = function () {
//   this.sucessor = {};
//   this.predecessor = {};
//   this.rows = [];  // {start:, interval:, successor:}

//   return this;
// };

// // find the best Node I know to be successor 
// // (basically if the id is on the interval of X row, that is the one)
// exports.findSucessor = function (fingerTable, id) {

// };
