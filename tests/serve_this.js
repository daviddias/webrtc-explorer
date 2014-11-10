var chord = require('./../index.js');
var ppClient = require('piri-piri.client');

window.app = {
  init: function () {

    var ppOptions = { url: 'http://localhost:9876' };

    ppClient.start(ppOptions, function () {
      
      var nodeConfig = {
        signalingURL: 'http://localhost:9000',
        tracing: true
      };

      var node;    

      ppClient.registerAction('create-node', function (data) {
        
        node = chord.createNode(nodeConfig);      
      
        node.on('trace', function(trace){
          ppClient.sendMessage(trace);
        });

        
        node.on('message-receive', function (message){
        });

      });

      // 
      // ppClient.registerAction('send-message', function (message) {
      //   node.emit('message-send', message);
      // });
      

    });
  }
};

window.app.init();