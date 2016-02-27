![](/graphs/webrtc-explorer-logo-small.png)

[![Dependency Status](https://david-dm.org/diasdavid/webrtc-explorer.svg)](https://david-dm.org/diasdavid/webrtc-explorer)
[![](https://img.shields.io/badge/project-WebCompute-blue.svg?style=flat-square)](https://github.com/diasdavid/WebCompute)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

![](https://raw.githubusercontent.com/diasdavid/interface-connection/master/img/badge.png)
![](https://raw.githubusercontent.com/diasdavid/interface-transport/master/img/badge.png)

> **tl;dr** `webrtc-explorer` is a [Chord](http://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf) inspired, P2P Network Routing Overlay designed for the Web platform (browsers), using WebRTC as its layer of transport between peers and WebSockets for the exchange of signalling data (setting up a connection and NAT traversal). Essentially, webrtc-explorer enables your peers (browsers) to communicate between each other without the need to have a server to be the mediator.

# Usage

## Install

```sh
> npm install webrtc-explorer
```

If you want to use the Signalling Server that comes with webrtc-explorer, you can use it through your terminal after installing webrtc-explorer globally

```sh
> npm install webrtc-explorer --global
# ...
> sig-server
Signalling Server Started
# now the signalling server is running
```

Use [browserify](http://browserify.org) to load transpile your JS code that uses webrtc-explorer, so that all of the dependencies are correctly loaded.

## API

```javascript
const explorer = require('webrtc-explorer')
```

#### listen

Connects your explorer node to the signalling server, and listens for incomming connections from other peers.

```javascript
const listener = explorer.createListener((socket) => {
  // socket with another peer
})

listener.listen((err) => {
  if (err) {
    return console.log('Error listening:', err)
  }
  console.log('explorer is now listining to incomming connections')
})
```

#### dial

Dials into another peer, using the P2P Overlay Routing.

```JavaScript
const socket = explorer.dial(<peerId> [, <readyCallback>])
```

Note: since an explorer node routes messages for other peers and itself, it needs first to be ready to 'listen', in order to be able to use the network to send.

#### updateFinger

_not implemented yet_

updates a finger on the finger table (if no finger was present on that row, it is added).

```JavaScript
explorer.updateFinger(<row>)
```

#### updateFingerTable

_not implemented yet_

updates all the rows on the finger table that already had a peer

```JavaScript
explorer.updateFingerTable(<row>)
```

# Architecture

## Signalling

## Routing

To understand fully webrtc-explorer's core, it is important to be familiar with the [Chord][chord-paper].

## Connections

## Notes and other properties

- Ids have 48 bits (so that is a multiple of 4 (for hex notation) and doesn't require importing a big-num lib to handle over 53 bits operations)
- The number of fingers of each peer is flexible, however it is recommended to not pass 16 per node (due to browser resource constraints)
- Each peer is responsible for a segment of the hash ring









-----------------------------------------------------------------------------

## Initial Development and release was supported by INESC-ID (circa Mar 2015)

> [David Dias MSc in Peer-to-Peer Networks by Technical University of Lisbon](https://github.com/diasdavid/browserCloudjs#research-and-development)

[![](https://img.shields.io/badge/INESC-GSD-brightgreen.svg?style=flat-square)](http://www.gsd.inesc-id.pt/) [![](https://img.shields.io/badge/TÉCNICO-LISBOA-blue.svg?style=flat-square)](http://tecnico.ulisboa.pt/) [![](https://img.shields.io/badge/project-browserCloudjs-blue.svg?style=flat-square)](https://github.com/diasdavid/browserCloudjs)

This work was developed by David Dias with supervision by Luís Veiga, all in INESC-ID Lisboa (Distributed Systems Group), Instituto Superior Técnico, Universidade de Lisboa, with the support of Fundação para a Ciência e Tecnologia. 

More info on the team's work at: 
- http://daviddias.me
- http://www.gsd.inesc-id.pt/~lveiga

If you use this project, please acknowledge it in your work by referencing the following document:

David Dias and Luís Veiga. browserCloud.js A federated community cloud served by a P2P overlay network on top of the web platform. INESC-ID Tec. Rep. 14/2015, Apr. 2015
