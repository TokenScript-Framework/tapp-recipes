import { polygon, sepolia } from 'viem/chains';
import { isProd } from './utils';

export const VIEWER_URL = isProd
  ? 'https://viewer.tokenscript.org/'
  : 'https://viewer-staging.tokenscript.org/';

export const CHAIN_ID = isProd ? polygon.id : sepolia.id;

export const MORCHI_NFT_CONTRACT = isProd
  ? '0xB48f53010Acbc0E24D3D12D892E2215879e6fD13'
  : '0xecD8D3736C6bCE00440bf76db56f032d97121Fc7';

export const DUTCH_AUCTION_CONTRACT = isProd
  ? ''
  : '0xc4d2F43F9743fF3625E1E2e200E181c2b7F23f2b';
