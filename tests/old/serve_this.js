var Explorer = require('./../src/index.js');
var pp = require('piri-piri.client');

window.app = {
    init: function() {

        pp.start({url: 'http://localhost:9876'}, function() {

            var config = {
                signalingURL: 'http://localhost:9000'
            };

            var peer = new Explorer(config);

            pp.register('register-peer', function() {
                console.log('register-peer');
                peer.register();
            });

            pp.register('send', function(data) {
                console.log('send-message', data.dstId, data.message);
                peer.send(data.dstId, data.message);
            });

            peer.events.on('registered', function(data) {
                console.log('peer-registered'); 
                pp.tell({
                    peerId: data.peerId,
                    message: 'peer-registered'
                });
            });            

            peer.events.on('ready', function(){
                console.log('peer-ready');
                pp.tell({
                    peerId: peer.peerId.toHex(),
                    message: 'peer-ready'
                }); 
            });
            
            peer.events.on('message', function(envelope) {
                console.log('received-message', envelope);
                pp.tell({
                    peerId: peer.peerId.toHex(),
                    message: envelope
                });
            });
        });
    }
};

window.app.init();
