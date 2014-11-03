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

experiment('Test webrtc-chord functionality', function () {
  var simpleIDs = {};
  var serverSignaling;

  before(function (done) {
    var options = {
      path: __dirname + '/serve_this.js',
      port: 9876,
      host: 'localhost'
    };
    
    pp.start(options, function(err) {
      if (err) { 
        console.log(err); process.exit(1); 
      }
      startSignalingServer(done);
    });
  });

  function startSignalingServer(cb) {
    serverSignaling = spawn('node', ['./../../webrtc-chord-signaling-server/index.js']);
    serverSignaling.stdout.on('data', function (data) {
      // console.log('stdout: ' + data);
    });
    serverSignaling.stderr.on('data', function (data) {
      // console.log('stderr: ' + data);
    });
    
    setTimeout(function () { 
      console.log('Signaling server has started');
      cb(); 
    }, 1000);    
  }


  after(function (done) {
    setTimeout(function () { 
      serverSignaling.on('close', function (code) {
        // console.log('cp exited: ' + code);
      });  
      serverSignaling.kill();
      pp.browserFarm.stop(function() { });
      pp.close(function (){ });
      done();
    }, 1000);
  });


  test('spawn 3 browsers', { timeout: 60 * 1000 }, function (done) {
    var url = pp.serverStats().uri;
    pp.browserFarm.spawn(url, 'canary', function() {});
    pp.browserFarm.spawn(url, 'canary', function() {});
    pp.browserFarm.spawn(url, 'canary', function() {});

    pp.waitForClients(3, function() {
      var clientIDs = pp.clientManager.getClientIDs();
      simpleIDs.A = clientIDs[0];
      simpleIDs.B = clientIDs[1];
      simpleIDs.C = clientIDs[2];        
      done();      
    }); 
  });

  test('first node connects to the network', function (done) {
    done();
  });

  test('second node connects to the network', function (done) {
    done();
  });


  // test('third node connects to the network', function (done){

  // });


  // test('Execute one action in one', function (done) {
  //   var clientA = pp.clientManager.getClient(simpleIDs.A);
  //   clientA.action('sum', { a:5, b:3 });
  //   done();
  // });

  // test('Execute one action in one and check the message', function (done) {
  //   var clientA = pp.clientManager.getClient(simpleIDs.A);
  //   clientA.action('sum-return', {a:2, b:2});
    
  //   setTimeout(function() {
  //     expect(clientA.getMessages().length).to.equal(1);
  //     expect(clientA.getMessages()[0].data.total).to.equal(4);
  //     done();  
  //   }, 800);
  // });


  // MOAR TESTS
  // Connect more browsers to a total of 5
  // Execute actions in all of them
  // Verify that all messages where received
  // Verify the pseudo external consistency

  // test('Verify pseudo external consistency', function (done) {
  //   done();
  // });
});