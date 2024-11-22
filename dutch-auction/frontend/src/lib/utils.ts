import { MyNftToken } from '@token-kit/onchain';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CHAIN_ID, MORCHI_NFT_CONTRACT } from './constant';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function shareOnTwitter(nft: MyNftToken) {
  const text = 'Want a Morchi NFT, check out this Auction!';
  const url = `https://viewer.tokenscript.org/?chain=${CHAIN_ID}&contract=${MORCHI_NFT_CONTRACT}&tokenId=${nft.tokenId}&scriptId=7738_X#card=Buy`;
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;

  window.open(twitterLink, '_blank');
}
