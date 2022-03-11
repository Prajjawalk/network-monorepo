import { collect, unique } from './GeneratorUtils'
import { StreamID, StreamMessage, StreamPartIDUtils } from 'streamr-client-protocol'
import { identity } from 'lodash'
import { PushPipeline } from './Pipeline'

export function waitForAssignmentsToPropagate(
    pushPipeline: PushPipeline<any>,
    targetStream: {
        id: StreamID,
        partitions: number
    }
): Promise<string[]> {
    return collect(
        unique<string>(
            pushPipeline
                .map((msg: StreamMessage) => (msg.getParsedContent() as any).streamPart)
                .filter((input: any) => {
                    try {
                        console.info('RECEIVED MESSAGE\n' + input)
                        const streamPartId = StreamPartIDUtils.parse(input)
                        const [streamId, partition] = StreamPartIDUtils.getStreamIDAndPartition(streamPartId)
                        return streamId === targetStream.id && partition < targetStream.partitions
                    } catch {
                        return false
                    }
                }),
            identity
        ),
        targetStream.partitions
    )
}
