<p align="center">
  <a href="https://streamr.network">
    <img alt="Streamr" src="https://raw.githubusercontent.com/streamr-dev/network-monorepo/main/packages/client/readme-header-img.png" width="1320" />
  </a>
</p>

<h1 align="left">
  Streamr JavaScript Client
</h1>

[![Build status](https://github.com/streamr-dev/monorepo/actions/workflows/client-build.yml/badge.svg)](https://github.com/streamr-dev/monorepo/actions/workflows/client-build.yml)
![latest npm package version](https://img.shields.io/npm/v/streamr-client?label=latest)
![GitHub stars](https://img.shields.io/github/stars/streamr-dev/network-monorepo?style=social)
[![Discord Chat](https://img.shields.io/discord/801574432350928907.svg?label=Discord&logo=Discord&colorB=7289da)](https://discord.gg/FVtAph9cvz)

This library allows you to easily interact with the [Streamr Network](https://streamr.network) from JavaScript-based environments, such as browsers and [node.js](https://nodejs.org). The library wraps a Streamr light node for publishing and subscribing to messages, as well as contains convenience functions for creating and managing streams.

| If you are using the Streamr Client in Node, NodeJS version `16.13.x` and NPM version `8.x` is required |
| --- |

Please see the [Streamr project docs](https://streamr.network/docs) for more detailed documentation.

## Contents
- [Getting started](#getting-started)
    - [Subscribing](#subscribing)
    - [Publishing](#publishing)
- [Setup](#setup)
- [Usage](#usage)
    - [API reference](#api-reference)
    - [Client creation](#client-creation)
    - [Creating a stream](#creating-a-stream)
    - [Subscribing to a stream](#subscribing-to-a-stream)
    - [Publishing to a stream](#publishing-to-a-stream)
    - [Requesting historical messages](#requesting-historical-messages)
    - [Searching for streams](#searching-for-streams)
    - [Interacting with the `Stream` object](#interacting-with-the-stream-object)
    - [Enabling storage](#enabling-storage)
    - [Data Unions](#data-unions)
    - [Utility functions](#utility-functions)
- [Advanced usage](#advanced-usage)
    - [Stream partitioning](#stream-partitioning)
    - [Disable message ordering and gap filling](#disable-message-ordering-and-gap-filling)
    - [Encryption keys](#encryption-keys)
    - [Proxy publishing](#proxy-publishing)
    - [Logging](#logging)

## Getting started

### Subscribing
```js
const streamId = 'streamr.eth/demos/helsinki-trams'

streamr.subscribe(streamId, (message) => {
    // handle for individual messages
})

```

### Publishing
```js
// Requires MATIC tokens (Polygon blockchain gas token)
const stream = await streamr.createStream({
    id: '/foo/bar'
})

await stream.publish({ timestamp: Date.now() })
```


More examples can be found in the [examples repo](https://github.com/streamr-dev/examples).
___


## Setup

### Installation
The client is available on [npm](https://www.npmjs.com/package/streamr-client) and can be installed simply by:

```
npm install streamr-client
```

### Importing `streamr-client`
To use with react please see [streamr-client-react](https://github.com/streamr-dev/streamr-client-react)

If using TypeScript you can import the library with:
```js
import { StreamrClient } from 'streamr-client'
```
If using Node.js you can import the library with:

```js
const { StreamrClient } = require('streamr-client')
```

For usage in the browser include the latest build, e.g. by including a `<script>` tag pointing at a CDN:

```html
<script src="https://unpkg.com/streamr-client@latest/streamr-client.web.js"></script>
```
___
## Usage

### API reference
See https://api-docs.streamr.network

### Client creation
In Streamr, Ethereum accounts are used for identity. You can generate an Ethereum private key using any Ethereum wallet, or you can use the utility function [`StreamrClient.generateEthereumAccount()`](#utility-functions), which returns the address and private key of a fresh Ethereum account. A private key is not required if you are only subscribing to public streams on the Network.

```js
const streamr = new StreamrClient({
    auth: {
        privateKey: 'your-private-key'
    }
})
```

Authenticating with an Ethereum private key contained in an Ethereum (web3) provider (e.g. MetaMask):
```js
const streamr = new StreamrClient({
    auth: {
        ethereum: window.ethereum,
    }
})
```

You can also create an anonymous client instance that can interact with public streams:
```js
const streamr = new StreamrClient()
```

### Creating a stream
```js
// Requires MATIC tokens (Polygon blockchain gas token)
const stream = await streamr.createStream({
    id: '/foo/bar'
})

console.log(stream.id) // e.g. `0x12345.../foo/bar`
```

You can also create a stream by defining the address in the provided id. Please note that the creation will only succeed if you specify the same address as provided for authentication when creating the `streamr` instance:
```js
// Requires MATIC tokens (Polygon blockchain gas token)
const stream = await client.createStream({
    id: `${address}/foo/bar`
})

console.log(stream.id) // e.g. `0x12345.../foo/bar`
```

More information on Stream IDs can be found under the [stream creation project docs](https://streamr.network/docs/streams/creating-streams)

### Subscribing to a stream
```js
const subscription = await streamr.subscribe(
    streamId,
    (content, metadata) => { ... }
)
```
The callback's first parameter, `content`, will contain the value given to the `publish` method.

The second parameter `metadata` is of type `StreamMessage`. It contains metadata about the message, e.g. timestamp.

Unsubscribing from an existent subscription:
```js
await streamr.unsubscribe(streamId)
// or, unsubscribe them all:
const streams = await streamr.unsubscribe()
```

Getting all streams the client is subscribed to:
```js
const subscriptions = streamr.getSubscriptions()
```
### Publishing to a stream

```js
// Here's our example data point
const msg = {
    temperature: 25.4,
    humidity: 10,
    happy: true
}

// Publish using the stream id only
await streamr.publish(streamId, msg)

// Publish with a specific timestamp as a Date object (default is now)
await streamr.publish(streamId, msg, new Date(1546300800123))

// Publish with a specific timestamp in ms
await streamr.publish(streamId, msg, 1546300800123)

// Publish with a specific timestamp as a ISO8601 string
await streamr.publish(streamId, msg, '2019-01-01T00:00:00.123Z')

// For convenience, stream.publish(...) equals streamr.publish(stream, ...)
await stream.publish(msg)
```

### Requesting historical messages
By default `subscribe` will not request historical messages.

You can fetch historical messages with the `resend` method:
```js
// Fetches the last 10 messages stored for the stream
const resend1 = await streamr.resend(
    streamId,
    {
        last: 10,
    },
    onMessage
)
```

Alternatively you can fetch historical messages and subscribe to real-time messages:
```js
// Fetches the last 10 messages and subscribes to the stream
const sub1 = await streamr.subscribe({
    id: streamId,
    resend: {
        last: 10,
    }
}, onMessage)
```
In order to fetch historical messages the stream needs to have [storage enabled](#enabling-storage).

Resend from a specific timestamp up to the newest message:
```js
const sub2 = await streamr.resend(
    streamId,
    {
        from: {
            timestamp: (Date.now() - 1000 * 60 * 5), // 5 minutes ago
            sequenceNumber: 0, // optional
        },
        publisher: '0x12345...', // optional
    }
)
```
Resend a range of messages:
```js
const sub3 = await streamr.resend(
    streamId,
    {
        from: {
            timestamp: (Date.now() - 1000 * 60 * 10), // 10 minutes ago
        },
        to: {
            timestamp: (Date.now() - 1000 * 60 * 5), // 5 minutes ago
        },
        // when using from and to the following parameters are optional
        // but, if specified, both must be present
        publisher: '0x12345...',
        msgChainId: 'ihuzetvg0c88ydd82z5o',
    }
)
```
If you choose one of the above resend options when subscribing, you can listen on the completion of this resend by doing the following:

```js
const sub = await streamr.subscribe(options)
sub.once('resendComplete', () => {
    console.log('Received all requested historical messages! Now switching to real time!')
})
```

Note that only one of the resend options can be used for a particular subscription.

### Searching for streams
You can search for streams by specifying a search term:
```js
const streams = await streamr.searchStreams('foo')
```
Alternatively or additionally to the search term, you can search for streams based on permissions.

To get all streams for which a user has any direct permission:
```js
const streams = await streamr.searchStreams('foo', {
    user: '0x12345...'
})
```
To get all streams for which a user has any permission (direct or public):
```js
const streams = await streamr.searchStreams('foo', {
    user: '0x12345...',
    allowPublic: true
})
```

It is also possible to filter by specific permissions by using `allOf` and `anyOf` properties. The `allOf` property should be preferred over `anyOf` when possible due to better query performance.

If you want to find the streams you can subscribe to:
```js
const streams = await streamr.searchStreams(undefined, {
    user: '0x12345...',
    allOf: [StreamPermission.SUBSCRIBE],
    allowPublic: true
})
```
___
### Interacting with the `Stream` object
The `Stream` type provides a convenient way to interact with a stream without having to repeatedly pass Stream IDs.
#### Getting existing streams
```js
const stream = await streamr.getStream(streamId)
```

The method getOrCreateStream gets the stream if it exists, and if not, creates it:
```js
// May require MATIC tokens (Polygon blockchain gas token)
const stream = await streamr.getOrCreateStream({
    id: streamId
})
```

#### Stream permissions

There are 5 different permissions:
- StreamPermission.PUBLISH
- StreamPermission.SUBSCRIBE
- StreamPermission.EDIT
- StreamPermission.DELETE
- StreamPermission.GRANT

You can import the `StreamPermission` enum with:
```js
const { StreamPermission } = require('streamr-client')
```

For each stream + user there can be a permission assignment containing a subset of those permissions. It is also possible to grant public permissions for streams (only `StreamPermission.PUBLISH` and `StreamPermission.SUBSCRIBE`). If a stream has e.g. a public subscribe permissions, it means that anyone can subscribe to that stream.


To grant a permission for a user:
```js
// Requires MATIC tokens (Polygon blockchain gas token)
await stream.grantPermissions({
    user: '0x12345...',
    permissions: [StreamPermission.PUBLISH],
})
```
Or to grant a public permission:
```js
await stream.grantPermissions({
    public: true,
    permissions: [StreamPermission.SUBSCRIBE]
})
```
To revoke a permission from a user:
```js
// Requires MATIC tokens (Polygon blockchain gas token)
await stream.revokePermissions({
    user: '0x12345...',
    permissions: [StreamPermission.PUBLISH]
})
```
Or revoke public permission:
```js
await stream.revokePermissions({
    public: true,
    permissions: [StreamPermission.SUBSCRIBE]
})
```


The method `streamr.setPermissions` can be used to set an exact set of permissions for one or more streams. Note that if there are existing permissions for the same users in a stream, the previous permissions are overwritten. Note that this method cannot be used from a stream, but via the `StreamrClient` instance:

```js
// Requires MATIC tokens (Polygon blockchain gas token)
await streamr.setPermissions({
    streamId,
    assignments: [
        {
            user: '0x11111...',
            permissions: [StreamPermission.EDIT]
        }, {
            user: '0x22222...'
            permissions: [StreamPermission.GRANT]
        }, {
            public: true,
            permissions: [StreamPermission.PUBLISH, StreamPermission.SUBSCRIBE]
        }
    ]
})
```

You can query the existence of a permission with `hasPermission()`. Usually you want to use `allowPublic: true` flag so that also the existence of a public permission is checked:
```js
await stream.hasPermission({
    permission: StreamPermission.PUBLISH,
    user: '0x12345...',
    allowPublic: true
}
```

The full list of permissions for a stream can be queried by calling `stream.getPermissions()`:
```js
const permissions = await stream.getPermissions()
```
The returned value is an array of permissions containing an item for each user, and possibly one for public permissions:
```js
permissions = [
    { user: '0x12345...', permissions: ['subscribe', 'publish'] },
    { public: true, permissions: ['subscribe']}
]
```

#### Updating a stream
To update the description of a stream:
```js
// Requires MATIC tokens (Polygon blockchain gas token)
await stream.update({
    description: 'New description'
})
```


#### Deleting a stream
To delete a stream:
```js
// Requires MATIC tokens (Polygon blockchain gas token)
await stream.delete()
```



### Enabling storage

You can enable storage on your streams to retain historical messages and access it later via `resend`. By default storage is not enabled on streams. You can enable it with:

```js
const { StreamrClient, STREAMR_STORAGE_NODE_GERMANY } = require('streamr-client')
...
// assign a stream to a storage node
await stream.addToStorageNode(STREAMR_STORAGE_NODE_GERMANY)
```
Other operations with storage:
```js
// remove the stream from a storage node
await stream.removeFromStorageNode(STREAMR_STORAGE_NODE_GERMANY)
// fetch the storage nodes for a stream
const storageNodes = stream.getStorageNodes()
```


### Data Unions
> ⚠️ This code examples in this section are not up to date.

The Data Union framework is a data crowdsourcing and crowdselling solution. Working in tandem with the Streamr Network and Ethereum, the framework powers applications that enable people to earn by sharing valuable data. You can [read more about it here](https://streamr.network/docs/data-unions/intro-to-data-unions)


To deploy a new DataUnion with default [deployment options](#deployment-options):
```js
const dataUnion = await streamr.deployDataUnion()
```

To get an existing (previously deployed) `DataUnion` instance:
```js
const dataUnion = await streamr.getDataUnion('0x12345...')
```


#### Admin Functions

Admin functions require xDai tokens on the xDai network. To get xDai you can either use a [faucet](https://www.xdaichain.com/for-users/get-xdai-tokens/xdai-faucet) or you can reach out on the [Streamr Discord #dev channel](https://discord.gg/gZAm8P7hK8).

Adding members using admin functions is not at feature parity with the member function `join`. The newly added member will not be granted publish permissions to the streams inside the Data Union. This will need to be done manually using, `streamr.grantPermissions()`. Similarly, after removing a member using the admin function `removeMembers`, the publish permissions will need to be removed in a secondary step using `revokePermissions()`.

Adding members:
```js
const receipt = await dataUnion.addMembers([
    '0x11111...',
    '0x22222...',
    '0x33333...',
])
```
Removing members:
```js
const receipt = await dataUnion.removeMembers([
    '0x11111...',
    '0x22222...',
    '0x33333...',
])
```

Checking if an address belongs to the Data Union:
```js
const isMember = await dataUnion.isMember('0x12345...')
```

Send all withdrawable earnings to the member's address:
```js
const receipt = await dataUnion.withdrawAllToMember('0x12345...')
```
Send all withdrawable earnings to the address signed off by the member:
```js
const recipientAddress = '0x22222...'

const signature = await dataUnion.signWithdrawAllTo(recipientAddress)
const receipt = await dataUnion.withdrawAllToSigned(
    '0x11111...', // member address
    recipientAddress,
    signature
)
```
Send some of the withdrawable earnings to the address signed off by the member
```js
const signature = await dataUnion.signWithdrawAllTo(recipientAddress)
const receipt = await dataUnion.withdrawAllToSigned(
    '0x12345...', // member address
    recipientAddress,
    signature
)

// Or to authorize a fixed amount:
const receipt = await dataUnion.withdrawAmountToSigned(
    '0x12345...', // member address
    recipientAddress,
    100, // token amount, in wei
    signature,
)
```

Setting a new admin fee:
```js
// Any number between 0 and 1, inclusive
const receipt = await dataUnion.setAdminFee(0.4)
```
#### Query functions
These are available for everyone and anyone, to query publicly available info from a Data Union.

Get Data Union's statistics:
```js
const stats = await dataUnion.getStats()
```
Get a member's stats:
```js
const memberStats = await dataUnion.getMemberStats('0x12345...')
```
Get the withdrawable DATA tokens in the DU for a member:
```js
// Returns a BigNumber
const balance = await dataUnion.getWithdrawableEarnings('0x12345...')
```
Getting the set admin fee:
```js
const adminFee = await dataUnion.getAdminFee()
```
Getting admin's address:
```js
const adminAddress = await dataUnion.getAdminAddress()
```

Getting the Data Union's version:
```js
const version = await dataUnion.getVersion()
// Can be 0, 1 or 2
// 0 if the contract is not a data union
```

#### Withdraw options

The functions `withdrawAll`, `withdrawAllTo`, `withdrawAllToMember`, `withdrawAllToSigned`, `withdrawAmountToSigned` all can take an extra "options" argument. It's an object that can contain the following parameters. The provided values are the default ones, used when not specified or when the options parameter is not provided:
```js
const receipt = await dataUnion.withdrawAll(
    ...,
    {
        sendToMainnet: true, // Whether to send the withdrawn DATA tokens to mainnet address (or sidechain address)
        payForTransport: true, //Whether to pay for the withdraw transaction signature transport to mainnet over the bridge
        waitUntilTransportIsComplete: true, // Whether to wait until the withdrawn DATA tokens are visible in mainnet
        pollingIntervalMs: 1000, // How often requests are sent to find out if the withdraw has completed, in ms
        retryTimeoutMs: 60000, // When to give up when waiting for the withdraw to complete, in ms
        gasPrice: /*Network Estimate*/ // Ethereum Mainnet transaction gas price to use when transporting tokens over the bridge
    }
)
```

These withdraw transactions are sent to the sidechain, so gas price shouldn't be manually set (fees will hopefully stay very low),
but a little bit of [sidechain native token](https://www.xdaichain.com/for-users/get-xdai-tokens) is nonetheless required.

The return values from the withdraw functions also depend on the options.

If `sendToMainnet: false`, other options don't apply at all, and **sidechain transaction receipt** is returned as soon as the withdraw transaction is done. This should be fairly quick in the sidechain.

The use cases corresponding to the different combinations of the boolean flags:

| `transport` | `wait`  | Returns | Effect |
| :---------- | :------ | :------ | :----- |
| `true`      | `true`  | Transaction receipt | *(default)* Self-service bridge to mainnet, client pays for mainnet gas |
| `true`      | `false` | Transaction receipt | Self-service bridge to mainnet (but **skip** the wait that double-checks the withdraw succeeded and tokens arrived to destination) |
| `false`     | `true`  | `null`              | Someone else pays for the mainnet gas automatically, e.g. the bridge operator (in this case the transaction receipt can't be returned) |
| `false`     | `false` | AMB message hash    | Someone else pays for the mainnet gas, but we need to give them the message hash first |

#### Deployment options

`deployDataUnion` can take an options object as the argument. It's an object that can contain the following parameters. All shown values are the defaults for each property:
```js
const ownerAddress = await streamr.getAddress()

const dataUnion = await streamr.deployDataUnion({
    owner: ownerAddress, // Owner / admin of the newly created Data Union
    joinPartsAgent: [ownerAddress], // Able to add and remove members to/from the Data Union
    dataUnionName: /* Generated if not provided */, // NOT stored anywhere, only used for address derivation
    adminFee: 0, // Must be between 0...1
    sidechainPollingIntervalMs: 1000, //How often requests are sent to find out if the deployment has completed
    sidechainRetryTimeoutMs: 60000, // When to give up when waiting for the deployment to complete
    confirmations: 1, // Blocks to wait after Data Union mainnet contract deployment to consider it final
    gasPrice: /*Network Estimate*/ // Ethereum Mainnet gas price to use when deploying the Data Union mainnet contract
})
```

Streamr Core is added as a `joinPartAgent` by default so that joining with secret works using the member function `join`. If you don't plan to use `join` for "self-service joining", you can leave out Streamr Core agent by calling `deployDataUnion` e.g. with your own address as the sole joinPartAgent:
```js
const dataUnion = await streamr.deployDataUnion({
    joinPartAgents: [ownerAddress],
    adminFee,
})
```

`dataUnionName` option exists purely for the purpose of predicting the addresses of Data Unions not yet deployed. Data Union deployment uses the [CREATE2 opcode](https://eips.ethereum.org/EIPS/eip-1014) which means a Data Union deployed by a particular address with particular "name" will have a predictable address.

### Utility functions
The static function `StreamrClient.generateEthereumAccount()` generates a new Ethereum private key and returns an object with fields `address` and `privateKey`.
```js
const { address, privateKey } = StreamrClient.generateEthereumAccount()
```
In order to retrieve the client's address an async call must me made to `streamr.getAddress`
```js
const address = await streamr.getAddress()
```

## Advanced usage
### Stream partitioning

Partitioning (sharding) enables streams to scale horizontally. This section describes how to use partitioned streams via this library. To learn the basics of partitioning, see [the docs](https://streamr.network/docs/streams#partitioning).

#### A note on stream ids and partitions
The public methods of the client generally support the following three ways of defining a stream:
```js
// Stream id as a string:
const streamId = `${address}/foo/bar`

// Stream id + partition as a string
const streamId = `${address}/foo/bar#4`

// Stream id + partition as an object
const streamId = {
    id: `${address}/foo/bar`,
    partition: 4
}
```

#### Creating partitioned streams

By default, streams only have 1 partition when they are created. The partition count can be set to any number between 1 and 100. An example of creating a partitioned stream:

```js
// Requires MATIC tokens (Polygon blockchain gas token)
const stream = await streamr.createStream({
    id: `/foo/bar`,
    partitions: 10,
})
console.log(`Stream created: ${stream.id}. It has ${stream.partitions} partitions.`)
```

#### Publishing to partitioned streams

In most use cases, a user wants related messages (e.g. messages from a particular device) to be assigned to the same partition, so that the messages retain a deterministic order and reach the same subscriber(s) to allow them to compute stateful aggregates correctly.

You can specify the partition number as follows:
```js
await streamr.publish({
    id: `${address}/foo/bar`,
    partition: 4
}, msg)
```

The library alternatively allows the user to choose a _partition key_, which simplifies publishing to partitioned streams by not requiring the user to assign a partition number explicitly. The same partition key always maps to the same partition. In an IoT use case, the device id can be used as partition key; in user interaction data it could be the user id, and so on.

The partition key can be given as an argument to the `publish` methods, and the library assigns a deterministic partition number automatically:

```js
await stream.publish(
    msg,
    Date.now(),
    msg.vehicleId // msg.vehicleId is the partition key here
)
```

#### Subscribing to partitioned streams

By default, the client subscribes to the first partition (partition `0`) of a stream. Be aware: this behavior will change in the future so that it will subscribe to _all_ partitions by default.

The partition number can be explicitly given in `subscribe`:

```js
const sub = await streamr.subscribe({
    id: streamId,
    partition: 4
}, (content) => {
    console.log('Got message %o', content)
})
```

If you want to subscribe to multiple partitions:
```js
const onMessage = (content, streamMessage) => {
    console.log('Got message %o from partition %d', content, streamMessage.getStreamPartition())
}

await Promise.all([2, 3, 4].map(async (partition) => {
    await streamr.subscribe({
        id: streamId,
        partition,
    }, onMessage)
}))
```

### Disable message ordering and gap filling
If your use case tolerates missing messages and message arriving out-of-order, you can turn off message ordering and gap filling when creating a instance of the client:
```js
const streamr = new StreamrClient({
    auth: { ... },
    orderMessages: false,
    gapFill: false
})
```
Both of these properties should be disabled in tandem for message ordering and gap filling to be properly turned off.

By disabling message ordering your application won't perform any filling nor sorting, dispatching messages as they come (faster) but without granting their collective integrity.


### Encryption keys

Messages published to a non-public stream are always encrypted. The publishing client creates the encryption keys and delivers them to the subscribers automatically. In most use cases, there is no need to manage encryption keys manually.

#### Typical use cases

A new encryption key is generated when publishing activity to a stream starts. The keys don't change during the lifetime of a client unless explicitly updated.

At any given time a subscriber can request a key from a publisher. When the publisher receives a request, it checks whether the subscriber has valid `StreamPermission.SUBSCRIBE` permission to the stream. If a valid permission exists, the client sends the encryption key to the subscriber. The subscriber can then use the key to decrypt messages which are encrypted with that key.

Typically subscribers query the current encryption key. But if they need to access to historical data, they may query previous encryption keys. A publisher client keeps track of all previous encryption keys in a local database, so it can respond to historical encryption key queries automatically. Therefore the publisher needs to stay online if historical decryption of its data is something that should be supported.

#### Manual key update

You can manually update the encryption key by calling `client.updateEncryptionKey(...)`. This triggers the creation of a new encryption key, after which the client starts to use that to encrypt published messages.

In practice, an update is needed if:

- You want to prevent new subscribers from reading historical messages. When you update the key, the new subscribers get the new key. But as the historical data is encrypted with some previous key, those messages aren't decryptable by the new subscribers.
- You want to prevent expired subscribers from reading new messages. When you update the key, but you don't distribute the new key to the expired subscribers, they aren't able to decrypt new messages.

Both of the use cases are covered if you call:
```
client.updateEncryptionKey({
    streamId,
    distributionMethod: 'rekey'
})
```

You may want to call this method regularly (e.g. daily/weekly). Alternatively you can call it anytime you observe new expired subscribers (that is, someone bought your data stream for a limited period of time, and that period has now elapsed).

#### Optimization: key rotation

You can optimize the key distribution by using `rotate` instead of `rekey`. The optimization is applicable if subscriptions haven't expired or been removed. In that situation you can update the key by calling:
```
client.updateEncryptionKey({
    streamId,
    distributionMethod: 'rotate'
})
```

In detail, the difference between the methods is:
- In `rekey` method, the client sends the new key individually to each subscriber. Every subscriber receives a separate message which is encrypted with their public RSA key. The `StreamPermission.SUBSCRIBE` permission is checked by the publisher for each subscriber before a key is sent.
- In optimized `rotate` method, the key is broadcasted to the network in the metadata of the next message. The key is encrypted with the previous encryption key and therefore subscribers can use it only if they know the previous key (https://en.wikipedia.org/wiki/Forward_secrecy). As the key is broadcasted to everyone, no permissions are checked. Note that recently expired subscribers most likely have the previous key, therefore they can use that new key, too.


### Proxy publishing and subscribing

In some cases the client might be interested in publishing messages without participating in the stream's message propagation. With this option the nodes can sign all messages they publish by themselves. Alternatively, a client could open a WS connection to a broker node and allow the broker to handle signing with its private key.

Setting subscribe proxies can be useful for cases where broker nodes with public IP addresses do not exist in a stream.

Proxy publishing and subscribing are handled on the network overlay level. This means that there is no need to know the IP address of the node that will be used as a proxy. Instead, the node needs to know the ID of the network node it wants to connect to. It is not possible to set publish / subscribe proxies for a stream that is already being "traditionally" subscribed or published to and vice versa.

```js

// Open publish proxy to multiple nodes on stream
await publishingClient.openProxyConnections(stream, ['0x11111...', '0x22222...'], ProxyDirection.PUBLISH)

// Remove publish proxy to multiple nodes on stream
await publishingClient.closeProxyConnections(stream, ['0x11111...', '0x22222...'], ProxyDirection.PUBLISH)

// Open publish proxy to multiple nodes on stream
await publishingClient.openProxyConnections(stream, ['0x11111...', '0x22222...'], ProxyDirection.SUBSCRIBE)

// Remove publish proxy to multiple nodes on stream
await publishingClient.closeProxyConnections(stream, ['0x11111...', '0x22222...'], ProxyDirection.SUBSCRIBE)
```

IMPORTANT: The node that is used as a proxy must have set the option on the network layer to accept incoming proxy connections and must have joined to the stream that a proxy connection is wanted for.

Example client config:

```json
{
    ...
    "network": {
        ...
        "acceptProxyConnections": true
    }
}
```

Example broker config

```json
{
    ...
    "client": {
        ...
        "network": {
            ...
            "acceptProxyConnections": true
        }
    },
    "plugins": {
        ...
        "subscriber": {
            "streams": [
                {
                    "streamId": "STREAM_ID",
                    "streamPartition": 0
                },
                {
                    "streamId": "STREAM_ID2",
                    "streamPartition": 0
                },
            ]
        }
    }
}
```

### Logging

The library supports [debug](https://github.com/visionmedia/debug) for logging.

In node.js, start your app like this: `DEBUG=StreamrClient* node your-app.js`

In the browser, set `localStorage.debug = 'StreamrClient*'`
