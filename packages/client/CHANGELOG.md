# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add method `subscribeAll` to subscribe to all stream partitions.
- Add method `resendAll` to resend data from all stream partitions.
- Method `updateEncryptionKey` to update stream encryption key

### Changed

- Method `getStorageNodesOf()` renamed to `getStorageNodes()`
- Method `getStoredStreamsOf()` renamed to `getStoredStreams()`
- Method `isStreamStoredInStorageNode()` renamed to `isStoredStream()`
- Methods `createOrUpdateNodeInStorageNodeRegistry()` and `removeNodeFromStorageNodeRegistry()` replaced with single method `setStorageNodeMetadata()`
- Method `stream.update()` now requires a parameter `props`
- Storage node assignment events:
  - method `registerStorageEventListeners(listener)` replaced with `on('addToStorageNode', listener)` and `on('removeFromStorageNode', listener)`
  - method `unRegisterStorageEventListeners()` replaced with `off('addToStorageNode', listener)` and `off('removeFromStorageNode', listener)`
- Resent event:
  - method `onResent(listener)` replaced with `subscription.once('resendComplete', listener)`
- Behavior changes: 
  - resends support multiple storage nodes (the data is fetched from a random storage node)
- Configuration parameter `groupKeys` renamed to `encryptionKeys`
- Exported classes `GroupKey` and `GroupKeyId` renamed to `EncryptionKey` and `EncryptionKeyId`

### Deprecated

### Removed

- Remove method `getAllStorageNodes()`, use `getStorageNodes()` without arguments instead
- Remove (non-functional) client configuration options `autoConnect` and `autoDisconnect`
- Remove method `disconnect()`, use `destroy()` instead
- Remove method `unsubscribeAll()`, use `unsubscribe()` without arguments instead
- Remove client configuration option `client.network.name`

### Fixed

- Fix timeout issue of method `addToStorageNode` when used with storage node cluster

### Security

## [6.0.2] - 2022-03-04

### Fixed

- Fixed an issue in which method `searchStreams` would throw on invalid metadata (NET-730)


## [6.0.1] - 2022-02-24

### Fixed
- Fixed an import so that the client successfully loads in a web browser environment (NET-721)

[Unreleased]: https://github.com/streamr-dev/network-monorepo/compare/client/v6.0.2...HEAD
[6.0.2]: https://github.com/streamr-dev/network-monorepo/compare/client/v6.0.1...client/v6.0.2
[6.0.1]: https://github.com/streamr-dev/network-monorepo/compare/client/v6.0.0...client/v6.0.1
