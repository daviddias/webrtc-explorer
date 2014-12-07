How does webrtc-ring work underneath?
=======================================

`webrtc-ring` can be described as a simplified Chord Algorithm where each node only knows its sucessor. To understand the whole Chord Algorithm, I recommend reading the [paper][1].

## Signaling Server


## Node joins


## Node leaves


## Routing a message through the ring


## Other considerations

- Javascript has a maximum int size of `2^53`, so we use `big-integer` librar y to provide the capability to operate `160 bit` numbers, while representing them in hex format

- The first 2 peers should join in a non concorrent manner, creating warmup 

[1]: http://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf