How does it work?
=======================================

webrtc-chord as the name suggests, uses the Chord algorithm, which you a description on the [paper][1].

## Chord paper synthesis

tl;dr - Chord is a distributed lookup protocol, peers maintain routing information and keep it updated as other peers join/leave the network. Numbers:
- A routing table update should not take more than O(Log^2 N)
- Each peer maintains O(Log N ) info about other peers
- Chord requires info of O(Log N) peers for efficient routing

`note: node and peer are used interchangebly`

### the base Chord Protocol
`this section does not cover concorrent joins or failures`

- When the `N^th` node joins or leaves, only `O(1/N)` fraction of keys move to a different location
- Chord doesn't use virtual nodes
- A `peer ID is a 160 bit unique identifier` (we use `SHA1` to calculate it)
- Let `m` be the number of bits in the ID identifier, each node routing table has at most m entries (AKA finger table)
- The first finger is known as the successor 

### finger table

table has `m` entries where `m = number of bits on identifier`

example: 
  in a table with identifiers of 3 bits

  ![](/img/3bit-hashring.png)

  finger[k].start = (n+2^(k-1)) mod 2^m , 
    where 1<=k<=m,
          n - id of this node
          m - number of bits used

  interval = [finger[k].start , finger[k].start]
  sucessor - to find the sucessor, ask the network who is responsible for the beginning of the interval

  ```
  # node 0 finger table
  --------------------------------
  start   | interval    | sucessor
  --------|-------------|---------
      1   |   [1,2)     |    1
      2   |   [2,4)     |    3
      4   |   [4,0)     |    0
  ```

### node joins

to simplify, each node maintains a predecessor for gracious leaves (they say, I still don't think this is beneficial for the webrtc-chord case, simply because there are open connections)

**flow:**

1. A new node wants to join the network, let's call it `njr`
2. `njr` asks for the signaling server to present him to random node in the network
3. the handshare is made (ICE'ing dance) and `njr` connects to this random node, now to be called, `railing-node`, 
4. `njr` generates his ID and asks for the node that is responsible for that ID (that will be the successor of `njr`)
5. the `railing-node` acts as the mediator for `njr`, so that `njr` can meet his sucessor (and then the sucessor will hack as the mediator for the rest of the finger table);

?? - Is our second Node int he 
?? - Consider having a refreshing process to make sure all the nodes have the right finger table (through gossip or some sort)
?? - Post fingertable from time to time to a server, and get it listed

### node leaves

when a node leaves, all the nodes that had it on their fingertable will receive an 'destroy' event, so, they must probe the network for who is responsible for that interval right now.

## Considerations

- Javascript has a maximum int size of `2^53`, so we use `big-integer` libraty to provide the capability to operate `160 bit` numbers, while representing them in hex format

- The first 3 peer should join in a non concorrent manner, creating warmp 

[1]: http://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf