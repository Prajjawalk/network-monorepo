import 'reflect-metadata'
import { container } from 'tsyringe'
import { toStreamID } from 'streamr-client-protocol'
import { initContainer } from '../../src/StreamrClient'
import { Stream } from '../../src/Stream'
import { StreamRegistry } from '../../src/StreamRegistry'
import { createStrictConfig } from '../../src/Config'

describe('Stream', () => {
    describe('update', () => {
        it('fields not updated if transaction fails', async () => {
            const config = createStrictConfig({})
            const { childContainer: mockContainer } = initContainer(config, container)
            mockContainer.registerInstance(StreamRegistry, {
                updateStream: jest.fn().mockRejectedValue(new Error('mock-error'))
            } as any)
            const stream = new Stream({
                id: toStreamID('mock-id'),
                description: 'original-description'
            }, mockContainer as any)

            await expect(() => {
                return stream.update({
                    description: 'updated-description'
                })
            }).rejects.toThrow('mock-error')
            expect(stream.description).toBe('original-description')
        })
    })
})
