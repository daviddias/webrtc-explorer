var Explorer = require('./../src/index.js');
var pp = require('piri-piri.client');

window.app = {
    init: function() {

        pp.start({url: 'http://localhost:9876'}, function() {

            var config = {
                signalingURL: 'http://localhost:9000',
                logging: true
            };

            var peer;

            pp.register('register-peer', function(data) {
                console.log('register-peer');
                peer = new Explorer(config);


                peer.events.on('registered', function() {
                    console.log('registered');
                });

                peer.events.on('ready', function() {
                    pp.tell({
                        peerId: peer.id(),
                        message: 'peer is ready'
                    });
                });

                peer.events.on('message', function(message) {
                    console.log('message-receive', message);
                    pp.tell({
                        peerId: peer.peerId.toHex(),
                        message: message
                    });
                });
            });
        });
    }
};

window.app.init();
