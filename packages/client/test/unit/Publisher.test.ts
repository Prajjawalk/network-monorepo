import 'reflect-metadata'
import { container } from 'tsyringe'
import { toStreamID } from 'streamr-client-protocol'
import { BrubeckNode } from '../../src/BrubeckNode'
import { Publisher } from '../../src/publish/Publisher'
import { initContainer } from '../../src'
import { StreamRegistry } from '../../src/StreamRegistry'
import { DEFAULT_PARTITION } from '../../src/StreamIDBuilder'
import { FakeStreamRegistry } from '../test-utils/fake/FakeStreamRegistry'
import { createStrictConfig } from '../../src/Config'

const AUTHENTICATED_USER = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
const PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001'
const TIMESTAMP = Date.parse('2001-02-03T04:05:06Z')
const STREAM_ID = toStreamID('/path', AUTHENTICATED_USER)

const createMockContainer = async (
    brubeckNode: Pick<BrubeckNode, 'publishToNode'>,
) => {
    const config = createStrictConfig({
        auth: {
            privateKey: PRIVATE_KEY
        }
    })
    const { childContainer } = initContainer(config, container)
    return childContainer
        .registerSingleton(StreamRegistry, FakeStreamRegistry as any)
        .register(BrubeckNode, { useValue: brubeckNode as any })
}

describe('Publisher', () => {

    let publisher: Pick<Publisher, 'publish' | 'stop'>
    let brubeckNode: Pick<BrubeckNode, 'publishToNode'>

    beforeEach(async () => {
        brubeckNode = {
            publishToNode: jest.fn()
        }
        const mockContainer = await createMockContainer(brubeckNode)
        publisher = mockContainer.resolve(Publisher)
        const streamRegistry = mockContainer.resolve(StreamRegistry)
        await streamRegistry.createStream(STREAM_ID)
    })

    it('happy path', async () => {
        await publisher.publish(STREAM_ID, {
            foo: 'bar'
        }, TIMESTAMP)
        await publisher.stop()
        expect(brubeckNode.publishToNode).toBeCalledTimes(1)
        const actual = (brubeckNode.publishToNode as any).mock.calls[0][0]
        expect(actual).toMatchObject({
            contentType: 0,
            encryptionType: 0,
            groupKeyId: null,
            messageId: {
                msgChainId: expect.anything(),
                publisherId: AUTHENTICATED_USER.toLowerCase(),
                sequenceNumber: 0,
                streamId: STREAM_ID,
                streamPartition: DEFAULT_PARTITION,
                timestamp: TIMESTAMP
            },
            messageType: 27,
            newGroupKey: null,
            parsedContent: { foo: 'bar' },
            prevMsgRef: null,
            serializedContent: '{"foo":"bar"}',
            signature: expect.anything(),
            signatureType: 2
        })
    })

    it('partition and partitionKey', async () => {
        // eslint-disable-next-line max-len
        return expect(() => {
            return publisher.publish({
                streamId: STREAM_ID,
                partition: 0
            }, {
                foo: 'bar'
            }, TIMESTAMP, 'mockPartitionKey')
        }).rejects.toThrow('Invalid combination of "partition" and "partitionKey"')
    })
})
