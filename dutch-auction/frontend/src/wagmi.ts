import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygon } from 'wagmi/chains';
import { isProd } from './lib/utils';

export const config = getDefaultConfig({
  appName: 'Morchi Auction',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [isProd ? polygon : sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
