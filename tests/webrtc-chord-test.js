var spawn = require('child_process').spawn;
var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var pp = require('piri-piri');
var uuid = require('../modules/uuid');

experiment('webrtc-chord:', function () {
  var simpleIDs = {};
  var serverSignaling;

  var clientA;
  var clientB;
  var clientC;
  var clientD;
  var clientE;  


  before(function (done) {
    var options = {
      path: __dirname + '/serve_this.js',
      port: 9876,
      host: 'localhost'
    };
    
    pp.start(options, function(err) {
      if (err) { console.log(err); process.exit(1); }
      startSignalingServer(done);
    });
  });

  function startSignalingServer(cb) {
    serverSignaling = spawn('node', ['./../webrtc-chord-signaling-server/index.js']);
    serverSignaling.stdout.on('data', function (data) {  console.log('stdout: ' + data);  });
    serverSignaling.stderr.on('data', function (data) {  console.log('stderr: ' + data);  });
    
    setTimeout(function () { 
      console.log('Signaling server has started');
      cb(); 
    }, 1000);    
  }

  after(function (done) {
    setTimeout(function () { 
      serverSignaling.on('close', function (code) { /* console.log('cp exited: ' + code); */ });  
      serverSignaling.kill();
      pp.farm.stop(function() {});
      pp.close(function () {});
      done();
    }, 1000);
  });


  test('spawn 3 browsers', { timeout: 60 * 1000 }, function (done) {
    pp.farm.spawn(pp.uri(), 'chrome');
    pp.farm.spawn(pp.uri(), 'chrome');
    pp.farm.spawn(pp.uri(), 'chrome');
    pp.farm.spawn(pp.uri(), 'chrome');
    pp.farm.spawn(pp.uri(), 'chrome');

    pp.waitForClients(5, function() {
      var clientIDs = pp.manager.getClientIDs();
      simpleIDs.A = clientIDs[0];
      simpleIDs.B = clientIDs[1];
      simpleIDs.C = clientIDs[2];   
      simpleIDs.D = clientIDs[3];      
      simpleIDs.E = clientIDs[4];      
         

      done();      
    }); 
  });


  test('connect 5 nodes to the signaling server to start the hashring',{timeout: 60*60*1000} ,  function (done) {
    clientA = pp.manager.getClient(simpleIDs.A);
    clientB = pp.manager.getClient(simpleIDs.B);
    clientC = pp.manager.getClient(simpleIDs.C);
    clientD = pp.manager.getClient(simpleIDs.D);
    clientE = pp.manager.getClient(simpleIDs.E);    
    
    setTimeout(function () { clientA.command('create-node', {}); }, 500);
    setTimeout(function () { clientB.command('create-node', {}); }, 1000);
    setTimeout(function () { clientC.command('create-node', {}); }, 1500);
    setTimeout(function () { clientD.command('create-node', {}); }, 2000);
    setTimeout(function () { clientE.command('create-node', {}); }, 2500);

    setTimeout(function () {
      // TEST EFFECTIVELY WITH PROBES
      done();
      // setTimeout(done, 5*60*1000); 
    },4000);
  });

  test('Send a Message from client A to a random ID, check who receives it',{timeout: 60*60*1000}, function(done) {
    clientA.waitToReceive(1, function () {
      console.log('A:', clientA.getQ());
      done();
    });

    clientB.waitToReceive(1, function () {
      console.log('B:', clientB.getQ());
      done();
    });

    clientC.waitToReceive(1, function () {
      console.log('C:', clientC.getQ());
      done();
    });    

    clientD.waitToReceive(1, function () {
      console.log('D:', clientD.getQ());
      done();
    });

    clientE.waitToReceive(1, function () {
      console.log('E:', clientE.getQ());
      done();
    });

    clientA.command('message-send', {
      destId: uuid.gen(),
      data: 'CLIENT A SAYS HI'
    });
  });


  // TODO: MOAR TESTS
  // Execute actions in all of them
  // Verify that all messages where received
  // Verify the pseudo external consistency
  // test('Verify pseudo external consistency', function (done) {
  //   done();
  // });
});