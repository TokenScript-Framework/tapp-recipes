import {
  createPublicClient,
  createWalletClient,
  custom,
  extractChain,
  http,
} from 'viem';
import { opBNB, opBNBTestnet } from 'viem/chains';

export const chain = extractChain({
  chains: [opBNBTestnet, opBNB],
  id: Number(tokenscript.env.SPIN_CONTRACT_CHAIN) as 5611 | 204,
});

export async function getWalletClient() {
  return createWalletClient({
    account: (await getWalletAddress()) as `0x${string}`,
    chain,
    transport: custom(window.ethereum),
  });
}

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export async function getWalletAddress() {
  const walletProvider = new ethers.BrowserProvider(window.ethereum);
  return (await walletProvider.listAccounts())[0]?.address;
}
