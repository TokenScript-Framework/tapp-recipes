import {
  createPublicClient,
  createWalletClient,
  custom,
  extractChain,
  http,
} from 'viem';
import { opBNB, opBNBTestnet } from 'viem/chains';

const chain = extractChain({
  chains: [opBNBTestnet, opBNB],
  id: Number(tokenscript.env.SPIN_CONTRACT_CHAIN) as 5611 | 204,
});

export const walletClient = createWalletClient({
  account: walletAddress as `0x${string}`,
  chain,
  transport: custom(window.ethereum),
});

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});
