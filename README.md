webrtc-explorer
=======================================

**tl;dr** `webrtc-explorer` is a [Chord][chord-paper] inspired P2P overlay network designed for the Web platform (browsers), using WebRTC as its transport between peers and WebSockets for Signaling data. Essentially, it enables your peers (browsers) to communicate between each other without the need to have a server as a mediator of messages.

## Project Information

> [David Dias MSc in Peer-to-Peer Networks by Technical University of Lisbon](https://github.com/diasdavid/browserCloudjs#research-and-development)

[![](https://img.shields.io/badge/INESC-GSD-brightgreen.svg?style=flat-square)](http://www.gsd.inesc-id.pt/) [![](https://img.shields.io/badge/TÉCNICO-LISBOA-blue.svg?style=flat-square)](http://tecnico.ulisboa.pt/) [![](https://img.shields.io/badge/project-browserCloudjs-blue.svg?style=flat-square)](https://github.com/diasdavid/browserCloudjs)

This work was developed by David Dias with supervision by Luís Veiga, all in INESC-ID Lisboa (Distributed Systems Group), Instituto Superior Técnico, Universidade de Lisboa, with the support of Fundação para a Ciência e Tecnologia. 

More info on the team's work at: 
- http://daviddias.me
- http://www.gsd.inesc-id.pt/~lveiga

If you use this project, please acknowledge it in your work by referencing the following document:

David Dias and Luís Veiga. browserCloud.js A federated community cloud served by a P2P overlay network on top of the web platform. INESC-ID Tec. Rep. 14/2015, Apr. 2015

# Badgers
[![NPM](https://nodei.co/npm/webrtc-explorer.png?downloads=true&stars=true)](https://nodei.co/npm/webrtc-explorer/)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/diasdavid/webrtc-explorer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) 
[![Dependency Status](https://david-dm.org/diasdavid/webrtc-explorer.svg)](https://david-dm.org/diasdavid/webrtc-explorer)

[![](https://cldup.com/pgZbzoshyV-3000x3000.png)](http://www.gsd.inesc-id.pt/)

# Properties

- Ids have 48 bits (so that is a multiple of 4 (for hex notation) and doesn't require importing a big-num lib to handle over 53 bits operations)
- The number of fingers of each peer is flexible, however it is recommended to not pass 16 per node (due to browser resource constraints)
- Each peer is responsible for a segment of the hash ring
- The signaling server for webrtc-explorer can be found at: https://github.com/diasdavid/webrtc-explorer-signalling-server

# Usage

`webrtc-explorer` uses [browserify](http://browserify.org)

### Create a new peer

```javascript
var Explorer = require('webrtc-explorer');

var config = {
    signalingURL: 'http://url-to-webrtc-ring-signaling-server.com'
};
var peer = new Explorer(config);

peer.events.on('ready', function () {
    // this node is ready
});
```

### Register the peer

```javascript
peer.events.on('registered', function(data){
    // peer registered with data.peerId
});

peer.register();
```

### Send and receive a message

peerIds are 48 bits represented in a string using hex format. To send, in one peer:

```javascript
var data = 'hey peer, how is it going';

peer.send('abcd0f0fdbca', data);
```

To receive, in another peer (responsible for that Id)

```javascript
peer.events.on('message', function(envelope){
    // message from the other peer envelope.data
});
```

### Other options

#### logging

  add the logging flag to your config

```javascript
var config = {
    //...
    logging: true
};
```

# How does it work

To understand fully webrtc-explorer's core, it is crucial to be familiar with the [Chord][chord-paper]. webrtc-explorer levarages important battle experience from building webrtc-ring - http://blog.daviddias.me/2014/12/20/webrtc-ring

* I'll upload my notes and images `soon`, I'm trying to make them as legible as possible. If you have a urgency in one of the parts, please let me know, so that I put that one as a priority.

## Registering a peer

## Updating the finger table

## Signaling between two peers

## Message routing






[chord-paper]: http://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf
