webrtc-explorer
=======================================

**tl;dr** `webrtc-explorer` is a [Chord][chord-paper] inspired P2P overlay network designed for the Web platform (browsers), using WebRTC as its transport between peers and WebSockets for Signaling data. Essentially, it enables your peers (browsers) to communicate between each other without the need to have a server as a mediator of messages.

# Badgers
[![NPM](https://nodei.co/npm/webrtc-explorer.png?downloads=true&stars=true)](https://nodei.co/npm/webrtc-explorer/)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/diasdavid/webrtc-explorer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) 
[![Dependency Status](https://david-dm.org/diasdavid/webrtc-explorer.svg)](https://david-dm.org/diasdavid/webrtc-explorer)

# Properties

- Ids have 48 bits (so that is a multiple of 4 (for hex notation) and doesn't require importing a big-num lib to handle over 53 bits operations)
- The number of fingers of each peer is flexible, however it is recommended to not pass 16 per node (due to browser resource constraints)
- Each peer is responsible for a segment of the hash ring

# Usage

`webrtc-explorer` uses [browserify](http://browserify.org)

## Create a new peer

```
var Explorer = require('webrtc-explorer');

var config = {
    signalingURL: 'http://url-to-webrtc-ring-signaling-server.com'
};
var peer = new Explorer(config);

peer.events.on('ready', function () {
    // this node is ready
});
```

## Register the peer

```
```

## Send and receive a message

```
```

## Other options

### logging

  add the logging flag to your config

  ```
  var config = {
    //...
    logging: true
    //...
  };
  ```

# How does it work

Read the CHORD paper
Some important learnings that are part of webrtc-explorer, were done in webrtc-ring
http://blog.daviddias.me/2014/12/20/webrtc-ring

## Registering a peer

## Updating the finger table

## Signaling between two peers

## Message routing
  
