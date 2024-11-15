import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygon } from 'wagmi/chains';
import { isProd } from './lib/utils';

export const config = getDefaultConfig({
  appName: 'Dutch Auction',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [isProd ? polygon : sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const CHAIN_ID = isProd ? 137 : 11155111;
