webrtc-chord
=======================================

DHT wrapper for p2p communication in the browser

`Disclaimer, it is not currently using a DHT, :P, it will, [sooooon](http://static.fjcdn.com/large/pictures/15/db/15db89_2831712.jpg)`

[canela-signaling](some other repo)

## Start canela

Canela returns an event emitter

```
var options = {
  signalingURL: 'your canela signaling server, defaults to '
  namespace: 'if you use same signaling server for several DHT, you can separete them through namespace, defaults to none' // not implemented yet :P
};

var canela = require('./canela')(options);

```

## Events emitted


```
// events emitted:
//   'message-receive' - received a message by another peer
//   ... others to come 
```


## Events listened too

```
// events listened
//   'message-send' - send a message to another peer
```