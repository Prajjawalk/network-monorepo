import assert from 'assert'

import ValidationError from '../../../../src/errors/ValidationError'
import TrackerMessage from '../../../../src/protocol/tracker_layer/TrackerMessage'
import RelayMessage from '../../../../src/protocol/tracker_layer/relay_message/RelayMessage'

describe('RelayMessage', () => {
    describe('constructor', () => {
        it('throws on null data', () => {
            assert.throws(() => new RelayMessage({
                requestId: 'requestId',
                originator: {
                    peerId: 'peerId',
                    peerType: 'node',
                    controlLayerVersions: [2],
                    messageLayerVersions: [32],
                    location: null
                },
                targetNode: 'targetNode',
                subType: 'offer',
                data: null
            }), ValidationError)
        })
        it('throws on null subType', () => {
            assert.throws(() => new RelayMessage({
                requestId: 'requestId',
                originator: {
                    peerId: 'peerId',
                    peerType: 'node',
                    controlLayerVersions: [2],
                    messageLayerVersions: [32],
                    location: null
                },
                targetNode: 'targetNode',
                subType: null as any,
                data: {
                    hello: 'world'
                }
            }), ValidationError)
        })
        it('throws on null targetNode', () => {
            assert.throws(() => new RelayMessage({
                requestId: 'requestId',
                originator: {
                    peerId: 'peerId',
                    peerType: 'node',
                    controlLayerVersions: [2],
                    messageLayerVersions: [32],
                    location: null
                },
                targetNode: null as any,
                subType: 'offer',
                data: {
                    hello: 'world'
                }
            }), ValidationError)
        })
        it('throws on null originatorId', () => {
            assert.throws(() => new RelayMessage({
                requestId: 'requestId',
                originator: null as any,
                targetNode: 'targetNode',
                subType: 'offer',
                data: {
                    hello: 'world'
                }
            }), ValidationError)
        })
        it('throws on null requestId', () => {
            assert.throws(() => new RelayMessage({
                requestId: null as any,
                originator: {
                    peerId: 'peerId',
                    peerType: 'node',
                    controlLayerVersions: [2],
                    messageLayerVersions: [32],
                    location: null
                },
                targetNode: 'targetNode',
                subType: 'offer',
                data: {
                    hello: 'world'
                }
            }), ValidationError)
        })
        it('should create the latest version', () => {
            const msg = new RelayMessage({
                requestId: 'requestId',
                originator: {
                    peerId: 'peerId',
                    peerType: 'node',
                    controlLayerVersions: [2],
                    messageLayerVersions: [32],
                    location: null
                },
                targetNode: 'targetNode',
                subType: 'offer',
                data: {
                    hello: 'world'
                }
            })
            assert(msg instanceof RelayMessage)
            assert.strictEqual(msg.version, TrackerMessage.LATEST_VERSION)
            assert.strictEqual(msg.requestId, 'requestId')
            assert.deepStrictEqual(msg.originator, {
                peerId: 'peerId',
                peerType: 'node',
                controlLayerVersions: [2],
                messageLayerVersions: [32],
                location: null
            })
            assert.strictEqual(msg.targetNode, 'targetNode')
            assert.deepStrictEqual(msg.subType, 'offer')
            assert.deepStrictEqual(msg.data, {
                hello: 'world'
            })
        })
    })
})
