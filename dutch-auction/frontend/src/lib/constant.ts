import { polygon, sepolia } from 'viem/chains';
import { isProd } from './utils';

export const VIEWER_URL = isProd
  ? 'https://viewer.tokenscript.org/'
  : 'https://viewer-staging.tokenscript.org/';

export const CHAIN_ID = isProd ? polygon.id : sepolia.id;

export const DUTCH_AUCTION_CONTRACT = isProd
  ? ''
  : '0xc4d2F43F9743fF3625E1E2e200E181c2b7F23f2b';
