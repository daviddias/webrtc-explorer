var SimplePeer = require('simple-peer');

exports = module.exports = ChannelManager;

function ChannelManager(peerId, ioc, router) {
    var self = this;

    /// establish a connection to another peer

    self.connect = function(dstId, cb) {
        log('connect to: ', dstId);

        var intentId = (~~(Math.random() * 1e9))
                        .toString(36) + Date.now();

        var channel = new SimplePeer({initiator: true,
                                      trickle: false});

        channel.on('signal', function (signal) {
            log('sendOffer');
            ioc.emit('s-send-offer', {offer: {
                intentId: intentId,
                srcId: peerId.toHex(),
                dstId: dstId,
                signal: signal
            }});
        });

        var listener = ioc.on('c-offer-accepted', offerAccepted);

        function offerAccepted(data) {
            if(data.offer.intentId !== intentId) { 
                log('OK: not right intentId: ', 
                        data.offer.intentId, intentId);
                return; 
            }
            log('offerAccepted');

            channel.signal(data.offer.signal);

            channel.on('ready', function() {
                log('channel ready to send');
                channel.on('message', function(){
                    log('DEBUG: this channel should be '+
                        'only used to send and not to receive');
                });
                cb(null, channel);
            });
        }
    };

    /// accept offers from peers that want to connect

    ioc.on('c-accept-offer', function(data) {
        log('acceptOffer');
        var channel = new SimplePeer({trickle: false});

        channel.on('ready', function() { 
            log('channel ready to listen');
            channel.on('message', router);
        });

        channel.on('signal', function (signal){
            // log('sending back my signal data');
            data.offer.signal = signal;
            ioc.emit('s-offer-accepted', data);
        });

        channel.signal(data.offer.signal);
    });

}
