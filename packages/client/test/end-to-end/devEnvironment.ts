import { Wallet } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { id } from 'ethers/lib/utils'
import { ConfigTest } from '../../src/ConfigTest'

export const providerSidechain = new JsonRpcProvider(ConfigTest.streamRegistryChainRPCs.rpcs[0])
export const providerMainnet = new JsonRpcProvider(ConfigTest.mainChainRPCs.rpcs[0])

export const tokenMediatorAddress = '0xedD2aa644a6843F2e5133Fe3d6BD3F4080d97D9F'

// can mint mainnet DATA tokens
export const tokenAdminPrivateKey = '0x5e98cce00cff5dea6b454889f359a4ec06b9fa6b88e9d69b86de8e1c81887da0'
export const tokenAdminWalletMainnet = new Wallet(tokenAdminPrivateKey, providerMainnet)
export const tokenAdminWalletSidechain = new Wallet(tokenAdminPrivateKey, providerSidechain)

export const dataUnionAdminPrivateKey = '0xe5af7834455b7239881b85be89d905d6881dcb4751063897f12be1b0dd546bdb'

afterAll(() => {
    providerMainnet.removeAllListeners()
    providerSidechain.removeAllListeners()
})

export function getTestWallet(index: number, provider: JsonRpcProvider) {
    // TODO: change to 'streamr-client-javascript' once https://github.com/streamr-dev/smart-contracts-init/pull/36 is in docker
    const hash = id(`marketplace-contracts${index}`)
    return new Wallet(hash, provider)
}

export function getMainnetTestWallet(index: number) {
    return getTestWallet(index, providerMainnet)
}

export function getSidechainTestWallet(index: number) {
    return getTestWallet(index, providerSidechain)
}

export const relayTokensAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_value',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: '_data',
                type: 'bytes'
            }
        ],
        name: 'relayTokensAndCall',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
]
