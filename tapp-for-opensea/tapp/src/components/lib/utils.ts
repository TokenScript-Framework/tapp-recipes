import { Chain } from "opensea-js";
import { createPublicClient, createWalletClient, custom, extractChain, http } from "viem";
import { base, baseSepolia, mainnet, polygon, sepolia } from "viem/chains";

const TEST_CHAINIDS = [11155111, 84532];

export function isTestChain(chainId: number) {
    return TEST_CHAINIDS.includes(chainId);
}

export function addressPipe(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}





export const walletClient = (chainId: number) => {

    const chain = extractChain({
        chains: [base, mainnet, polygon, baseSepolia, sepolia],
        id: chainId as 1 | 137 | 8453 | 84532 | 11155111,
    });
    return createWalletClient({
        account: walletAddress as `0x${string}`,
        chain,
        transport: custom(window.ethereum),
    });

}

interface ChainConfig {
    chainName: Chain;
    displayName: string;
    publicClient: typeof mainnet | typeof polygon | typeof base | typeof sepolia | typeof baseSepolia;
    scanUrl: string;
    openseaUrl: string; 
}

const CHAIN_CONFIGS: Record<number, ChainConfig> = {
    1: {
        chainName: Chain.Mainnet,
        displayName: 'Ethereum',
        publicClient: mainnet,
        scanUrl: 'https://etherscan.io',
        openseaUrl: 'https://opensea.io'
    },
    137: {
        chainName: Chain.Polygon,
        displayName: 'Polygon',
        publicClient: polygon,
        scanUrl: 'https://polygonscan.com',
        openseaUrl: 'https://opensea.io'
    },
    8453: {
        chainName: Chain.Base,
        displayName: 'Base',
        publicClient: base,
        scanUrl: 'https://basescan.org',
        openseaUrl: 'https://opensea.io'
    },
    11155111: {
        chainName: Chain.Sepolia,
        displayName: 'Sepolia',
        publicClient: sepolia,
        scanUrl: 'https://sepolia.etherscan.io',
        openseaUrl: 'https://testnets.opensea.io'
    },
    84532: {
        chainName: Chain.BaseSepolia,
        displayName: 'Base Sepolia',
        publicClient: baseSepolia,
        scanUrl: 'https://sepolia.basescan.org',
        openseaUrl: 'https://testnets.opensea.io'
    }
};

export function getChainConfig(chainId: number) {
    const config = CHAIN_CONFIGS[chainId] || CHAIN_CONFIGS[84532]; 
    return {
        chainName: config.chainName,
        displayName: config.displayName,
        publicClient: createPublicClient({
            chain: config.publicClient,
            transport: http()
        }),
        scanUrl: config.scanUrl,
        openseaUrl: config.openseaUrl
    };
}


