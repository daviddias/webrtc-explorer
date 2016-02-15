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
var Id = require('dht-id');

experiment(':', function() {
    var ppIds = {};
    var ringIds = {};
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
            if (err) {
                console.log(err); process.exit(1);
            }
        startSignalingServer(done);
        });
    });

    function startSignalingServer(cb) {
        signaling = spawn('node',
                      ['./../webrtc-explorer-signalling-server/src/index.js']);
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
            // console.log('cp exited: ' + code);
        });
        signaling.kill();
        pp.farm.stop(function() {});
        pp.close(function() {});
        done();
        }, 1000);
    });

    test('spawn 4 browsers', {timeout: 60 * 1000}, function(done) {
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

    // TODO
    // 1. connect the first peer
    // 2. connect the second peer (check if both emit 'ready' event
    // 3. send message from first to second (confirm message arrives)
    // 4. connect third peer (check for respective ready event)
    // 5. connect fouth peer (check for respective ready event)
    // 6. send message from C to D
    // if you need help how to make this, check github.com/diasdavid/webrtc-ring for inspiration
});
