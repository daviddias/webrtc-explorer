// 
// NO CONCEPT OF PEERCARD, DON'T GET BACK HERE!!
// 






















// exports = module.exports;

// exports.create = function(id, initiator, interpreter) {
//   return new peerCard(id, initiator, interpreter);
// }

// function peerCard(id, initiator interpreter) {
//   var id;
//   var channel = new simplePeer({ initiator: initiator, trickle: false });;




//     bootstrapPeer = new simplePeer({ initiator: true, trickle: false });
  
//     bootstrapPeer.on('signal', function (data) {
//       t.c('bootstrapPeer signal data', data);

//       var peerInvite = { signalData: data };
//       ioClient.emit('s-request', peerInvite);
//       log('Sent Simple Peer data to another Peer');
//       t.c('signal data sent to another peer', data);
//     });
    
//     bootstrapPeer.on('message', function (data) {
//       // Take care here of the messages that will enable us to reach yo our sucessor
//       // TODO LOT OF WORK
//     });
    
//     bootstrapPeer.on('ready', function() {
//       log('Connected to the network... filling finger table');   
//       // END OF PHASE I

//       // ask if my ID is ok 
//       // ask to connect with my successor! :)
//       // once connected to the sucessor, fill in the fingertable
//     });


//   //
//   // link two nodes through signaling server
//   //
//   // if (_signalingService !== undefined) {
//   //   var signalingService = _signalingService;
    
//   //   this.joinRequest = function() {
//   //     // join the Chord through the signaling server
//   //   };

//   //   this.joinResponse = function(inviteReply) {
//   //     // received response from this Node railing peer
//   //   };

//   //   this.railIn = function(invite) {
//   //     // rail new node in
//   //   };
//   // }

//   //
//   // link two nodes through chord
//   //

//   // this.connectRequest = function(peerId, finger, cb) {    
//   //   // initiator - connect through the `finger`

//   // };

//   // this.connectResponse = function (invite, finger, cb) {
//   //   // received request to connect, reply back with signalData through `finger`
//   //   // in the end don't update the fingerTable, fingers are unidirectional

//   // };

//   // this.connectEstablish = function(inviteReply, cb) {
//   //   // received inviteReply, establish connection
//   //   // in the end update the fingerTable

//   // };


//   // // 
//   // // communicate between two nodes
//   // //

//   // this.send = function() {
//   //   // send to the best candidate in the peerTable
//   // };

//   // function receive(data) {
//   //   // assert if we are the destination, if not, forward the message
//   // }

//   return this;
// };