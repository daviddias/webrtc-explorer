var chord = require('./../index.js');
var ppClient = require('piri-piri.client');

window.app = {
  init: function () {

    var ppOptions = { url: 'http://localhost:9876' };

    ppClient.start(ppOptions, function () {
      
      var nodeConfig = {
        signalingURL: 'http://localhost:9000',
        tracing: true,
        logging: true
      };

      var node;    

      ppClient.register('create-node', function (data) {
        console.log('ACTION :  create-node');

        node = chord.createNode(nodeConfig);      
      
        node.on('ready', function(){
          console.log('NODE IS READY');
        });

        node.on('trace', function(trace) {
          console.log('TRACE');
          ppClient.tell({trace: trace});
        });

        
        node.e.on('message-receive', function (message) {
          console.log('message-receive', message);
          ppClient.tell({'message': message});
        });

      });

      
      ppClient.register('message-send', function (message) {
        console.log('ACTION :  message-send');
        node.send(message);
      });
      
      ppClient.register('message-send-sucessor', function (message) {
        console.log('ACTION :  message-send-sucessor');
        node.emit('message-send-sucessor', message);
      });


    });
  }
};

window.app.init();