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
var uuid = require('webrtc-chord-uuid');
var bigInt = require('big-integer');
var utils = require('../../webrtc-chord-signaling-server/src/lib/utils');

experiment('webrtc-chord:', function() {
  var ppIds = {};
  var chordIds = {};
  var signaling;

  var cA;
  var cB;
  var cC;
  var cD;

  before(function(done) {
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
    signaling = spawn('node', ['./../webrtc-chord-signaling-server/src/index.js']);
    signaling.stdout.on('data', function(data) {
      console.log('stdout: \n' + data);
    });
    signaling.stderr.on('data', function(data) {
      console.log('stderr: \n' + data);
    });
    
    setTimeout(function() { 
      console.log('Signaling server has started');
      cb(); 
    }, 1000);    
  }

  after(function(done) {
    setTimeout(function() { 
      signaling.on('close', function(code) { 
        /* console.log('cp exited: ' + code); */ 
      });  
      signaling.kill();
      pp.farm.stop(function() {});
      pp.close(function() {});
      done();
    }, 1000);
  });


  test('spawn 4 browsers', { timeout: 60 * 1000 }, function(done) {
    pp.farm.spawn(pp.uri(), 'canary');
    pp.farm.spawn(pp.uri(), 'canary');
    pp.farm.spawn(pp.uri(), 'canary');
    pp.farm.spawn(pp.uri(), 'canary');

    pp.waitForClients(4, function() {
      var clientIDs = pp.manager.getClientIDs();
      ppIds.A = clientIDs[0];
      ppIds.B = clientIDs[1];
      ppIds.C = clientIDs[2];   
      ppIds.D = clientIDs[3];      

      cA = pp.manager.getClient(ppIds.A);
      cB = pp.manager.getClient(ppIds.B);
      cC = pp.manager.getClient(ppIds.C);
      cD = pp.manager.getClient(ppIds.D);

      done();      
    }); 
  });


  test('connect 2 nodes to the signaling server to start the hashring',{timeout: 60*60*1000} ,  function(done) {    
    createNodeFromClient(cA, 500);
    createNodeFromClient(cB, 1000);

    var count = 0;
    waitForClient(cA, 'A');
    waitForClient(cB, 'B');
    // waitForClient(cC, 'C');
    // waitForClient(cD, 'D');

    function waitForClient(client, identifier) {
      client.waitToReceive(1, function() {
        var q = client.getQ();
        expect(q[0].data.nodeId).to.be.string();
        expect(q[0].data.message).to.be.string();
        expect(q[0].data.message).to.equal('node is ready');
        client.clearQ();
        chordIds[identifier] = q[0].data.nodeId;
        count += 1;

        if(count === 2) {
          done();
        }
      });
    }
  });

  test('send message from A to B', function(done) {
    cA.command('send',{
      toId: chordIds.B,
      message: 'hey, how is it going B'
    });

    cB.waitToReceive(1, function() {
      var q = cB.getQ();
      expect(q[0].data.nodeId).to.be.string();
      expect(q[0].data.message).to.be.string();
      cB.clearQ();
      done();
    });
  });


  test('connect a third node',{timeout: 60*60*1000} ,  function(done) {    
    createNodeFromClient(cC, 100);

    waitForClient(cC, 'C');

    function waitForClient(client, identifier) {
      client.waitToReceive(1, function() {
        var q = client.getQ();
        expect(q[0].data.nodeId).to.be.string();
        expect(q[0].data.message).to.be.string();
        expect(q[0].data.message).to.equal('node is ready');
        client.clearQ();
        chordIds[identifier] = q[0].data.nodeId;
        setTimeout(done, 2000);
      });
    }
  });

  test('verify the fingerTable', {timeout: 60*60*1000} ,  function(done) {
    cA.command('finger-table', {});
    cB.command('finger-table', {});
    cC.command('finger-table', {});

    var count = 0;
    var fingers = {};

    collect(cA, 'A');
    collect(cB, 'B');
    collect(cC, 'C');

    function collect(client, identifier) {
      client.waitToReceive(1, function() {
        var q = client.getQ();
        fingers[identifier] = q[0].data;
        client.clearQ();
        count += 1;
        if (count === 3) {
          verify();
        }
      });      
    }

    function verify() {
      expect(fingers.A.sucessor).to.not.equal(fingers.B.sucessor);
      expect(fingers.B.sucessor).to.not.equal(fingers.C.sucessor);
      expect(fingers.C.sucessor).to.not.equal(fingers.A.sucessor);      
      done();
    }
  });

  test('kill node A');

  // test('connect a fourth node', {timeout: 60*60*1000} ,  function(done) {    
  //   createNodeFromClient(cD, 100);

  //   waitForClient(cD, 'D');

  //   function waitForClient(client, identifier) {
  //     client.waitToReceive(1, function() {
  //       var q = client.getQ();
  //       expect(q[0].data.nodeId).to.be.string();
  //       expect(q[0].data.message).to.be.string();
  //       expect(q[0].data.message).to.equal('node is ready');
  //       client.clearQ();
  //       chordIds[identifier] = q[0].data.nodeId;
  //       setTimeout(done, 1000);
  //     });
  //   }
  // });

  

  // test('send message from B to D', {timeout: 60*60*1000}, function(done) {
  //   console.log(chordIds)
  //   cB.command('send', {
  //     toId: chordIds.D,
  //     message: 'hey, how is it going D'
  //   });

  //   cD.waitToReceive(1, function() {

  //     var q = cD.getQ();
  //     expect(q[0].data.nodeId).to.be.string();
  //     expect(q[0].data.message).to.be.string();
  //     cD.clearQ();
  //     setTimeout(done, 1000);
  //   });
  // });

  /// helper functions

  function createNodeFromClient(client, time) {
    setTimeout(function() { 
      client.command('create-node', {}); 
    }, 500);
  }



  /// TESTS
  // - [X] Connect 2 browsers
  // - [X] Send message from A to B
  // - [X] Connect third browser, check if the other browser reattached - 
  // - [ ] Kill first browser -
  // - [X] Connect fourth browser - 
  // - [ ] Send message from B TO D 

});