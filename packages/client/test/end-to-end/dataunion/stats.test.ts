import debug from 'debug'

import { StreamrClient } from '../../../src/StreamrClient'
import { ConfigTest } from '../../../src/ConfigTest'
import { DataUnion, MemberStatus } from '../../../src/dataunion/DataUnion'
import { getRandomClient, createMockAddress, expectInvalidAddress } from '../../test-utils/utils'
import { BigNumber } from '@ethersproject/bignumber'

const log = debug('StreamrClient::DataUnion::integration-test-stats')

describe('DataUnion stats', () => {

    let adminClient: StreamrClient
    let dataUnion: DataUnion
    let queryClient: StreamrClient
    const nonce = Date.now()
    const activeMemberAddressList = [
        `0x100000000000000000000000000${nonce}`,
        `0x200000000000000000000000000${nonce}`,
        `0x300000000000000000000000000${nonce}`,
    ]
    const inactiveMember = createMockAddress()

    beforeAll(async () => {
        log('ClientOptions: %O', ConfigTest)
        adminClient = new StreamrClient(ConfigTest as any)
        dataUnion = await adminClient.deployDataUnion()
        await dataUnion.addMembers(activeMemberAddressList.concat([inactiveMember]))
        await dataUnion.removeMembers([inactiveMember])
        queryClient = getRandomClient()
    }, 60000)

    it('DataUnion stats', async () => {
        const du = await queryClient.getDataUnion(dataUnion.getAddress())
        const stats = await du.getStats()
        expect(stats.activeMemberCount).toEqual(BigNumber.from(3))
        expect(stats.inactiveMemberCount).toEqual(BigNumber.from(1))
        expect(stats.joinPartAgentCount).toEqual(BigNumber.from(2))
        expect(stats.totalEarnings).toEqual(BigNumber.from(0))
        expect(stats.totalWithdrawable).toEqual(BigNumber.from(0))
        expect(stats.lifetimeMemberEarnings).toEqual(BigNumber.from(0))
    }, 150000)

    it('member stats', async () => {
        const du = await queryClient.getDataUnion(dataUnion.getAddress())
        const memberStats = await Promise.all(
            activeMemberAddressList
                .concat([inactiveMember])
                .map((m) => du.getMemberStats(m))
        )

        const ZERO = BigNumber.from(0)
        expect(memberStats).toMatchObject([{
            status: MemberStatus.ACTIVE,
            earningsBeforeLastJoin: ZERO,
            totalEarnings: ZERO,
            withdrawableEarnings: ZERO,
        }, {
            status: MemberStatus.ACTIVE,
            earningsBeforeLastJoin: ZERO,
            totalEarnings: ZERO,
            withdrawableEarnings: ZERO,
        }, {
            status: MemberStatus.ACTIVE,
            earningsBeforeLastJoin: ZERO,
            totalEarnings: ZERO,
            withdrawableEarnings: ZERO,
        }, {
            status: MemberStatus.INACTIVE,
            earningsBeforeLastJoin: ZERO,
            totalEarnings: ZERO,
            withdrawableEarnings: ZERO,
        }])
    }, 150000)

    it('member stats: no member', async () => {
        const du = await queryClient.getDataUnion(dataUnion.getAddress())
        const memberStats = await du.getMemberStats(createMockAddress())
        const ZERO = BigNumber.from(0)
        expect(memberStats).toMatchObject({
            status: MemberStatus.NONE,
            earningsBeforeLastJoin: ZERO,
            totalEarnings: ZERO,
            withdrawableEarnings: ZERO
        })
    })

    it('member stats: invalid address', () => {
        return expectInvalidAddress(() => dataUnion.getMemberStats('invalid-address'))
    })
})
