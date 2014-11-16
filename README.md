webrtc-chord
=======================================

**tl;dr** webrtc-chord is a implementation of the Chord lookup algorithm, using WebRTC datachannels as the link between nodes. You can find more about how the algorithm works on [HOW_DOES_IT_WORK](/HOW_DOES_IT_WORD.md)

> DISCLAIMER, THIS IS UNDER ACTIVE DEVELOPMENT, in another words, lot of the docs, tests, features might be a lot of times out of sync, but I'll try to keep consistency and push always a 'working version', this is currently only developed by one person with a tight schedule.


It enables you to communicate between several browsers in a p2p/decentralized fashion.

# How to create a node

  webrtc-chord uses [browserify](http://browserify.org/)

  ```
  var chord = require('webrtc-chord');

  var nodeConfig = {
    signalingURL: 'http://url-to-webrtc-chord-signaling-server.com'
  };
  var node = chord.createNode(nodeConfig);

  node.on('ready', function (){
    // this node is ready
  });
  ```

# How to communicate with other nodes


  Send a message to a Node responsible for the ID `1af17e73721dbe0c40011b82ed4bb1a7dbe3ce29`

  ```
  var nodeToSend = '1af17e73721dbe0c40011b82ed4bb1a7dbe3ce29'; // 160 bit ID represented in hex(git_sha1 module is a good way to generate these)

  node.emit('message-send', { destID: '1af17e73721dbe0c40011b82ed4bb1a7dbe3ce29', 
                              data: 'hey, how are you doing' });
  ```

  Receive a message
  ```
  node.on('message-receive', function(message) {
    console.log(message.data);
  });
  ```

# Other options

## finger table updates
  - use tracing for this


## logging

  add the logging flag to your nodeConfig

  ```
  var nodeConfig = {
    //...
    logging: true
    //...
  };
  ```

## tracing

  In order to understand the events which happen on the webrtc-chord network and their order, webrtc-chord using a tracing module ([`canela`](https://github.com/diasdavid/canela)).

  To activate it, simply add tracing to your config:

  ```
  var nodeConfig = {
    //...
    tracing: true
    //...
  };
  ```

  Then, the returned EventEmitter from `.createChord()` will also emit the events described on the tracing DSL. Each trace has a specific id per tag, so it is easy to identify them automatically.

### tracing DSL

#### tag: `signaling`
  - id: 1    description: node connected to signaling server    
  example: 
  ```
  {
    id: 1,
    description: 'node connected to signaling server'
  }
  ```
  - id: 2    description: there are no other nodes present in the ring
  example:
  - id: 3    description: received a request to rail new peer into the ring
  example:
  - id: 4    description: connected to railing peer
  example:
  - id: 5    description: connected to sucessor 
  example:
  - id: 6    description: connected to entrace :number: of finger table
  example:

#### tag: `finger-table`
  - id: 1    description: update    
  example:

#### tag: `message`
  - id: 1    description: receive   
  example:
  - id: 2    description: sent    
  example:
  - id: 3    description: forward    
  example:


# TODO: 

- [ ] Support node leaves (for example, when a browser closes a tab); 
- [ ] If the socket.io server goes down and we are already connected, don't do the bootstrap process all over again due to .on('connect') event
- [ ] Make the state of the ring on webrtc-chord-signalling-server persistent
- [ ] Improve vastly the quality of log messages
- [ ] Implement the process for a Node to fill his finger table
