import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygon } from 'wagmi/chains';
import { http } from 'wagmi';
import { CHAIN_ID, isProd } from './lib/constant';

export const config = getDefaultConfig({
  appName: 'Morchi Auction',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [isProd ? polygon : sepolia],
  transports: {
    [CHAIN_ID]: http(
      isProd
        ? `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
        : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
    ),
  },
  batch: {
    // Apply the same config as ethers.js batch provider
    multicall: {
      batchSize: 100,
      wait: 10,
    },
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});
