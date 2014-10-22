webrtc-chord
=======================================

tl;dr; webrtc-chord is a implementation of the Chord lookup algorithm, using WebRTC datachannels as the link between nodes. You can find more about how the algorithm works on [HOW_DOES_IT_WORK](/HOW_DOES_IT_WORD.md)

It enables you to communicate between several browsers in a p2p fashion.

# How to create a node

webrtc-chord uses browserify

```
var chord = require('webrtc-chord');

var nodeConfig = {
  signalingURL: 'http://url-to-webrtc-chord-signaling-server.com'
};
var node = chord.createNode(nodeConfig);
```

# How to communicate with other nodes


Send a message to a Node responsible for the ID `1af17e73721dbe0c40011b82ed4bb1a7dbe3ce29`

```
var nodeToSend = '1af17e73721dbe0c40011b82ed4bb1a7dbe3ce29'; // 160 bit ID represented in hex(git_sha1 is a good way to generate these)

node.emit('message-send', { destID: '1af17e73721dbe0c40011b82ed4bb1a7dbe3ce29', 
                            data: 'hey, how are you doing'});
```

Receive a message
```
node.on('message-receive', function(message) {
  console.log(message.data);
});
```

# Other options

## finger table

## logging

add the logging flag to your nodeConfig

var nodeConfig = {
  signalingURL: 'http://url-to-webrtc-chord-signaling-server.com',
  logging: true
};

## tracing

add a ton of traces for tests and other reasons

traces

'trace-something'
