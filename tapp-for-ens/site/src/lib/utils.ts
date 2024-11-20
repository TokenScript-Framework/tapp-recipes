import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { ethers } from 'ethers'
import { Chain } from 'opensea-js'
import { twMerge } from 'tailwind-merge'
import { detectMainnet } from './constant'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface OpenSeaListing {
  created_date: string
  expiration_time: number
  order_hash: string
  protocol_data: {
    parameters: {
      offerer: string
      offer: Array<{
        itemType: number
        token: string
        identifierOrCriteria: string
        startAmount: string
        endAmount: string
      }>
      consideration: Array<{
        itemType: number
        token: string
        identifierOrCriteria: string
        startAmount: string
        endAmount: string
        recipient: string
      }>
    }
    signature: null
  }
  protocol_address: string
  current_price: string
  maker: {
    user: number
    profile_img_url: string
    address: string
    config: string
  }
  maker_asset_bundle: {
    assets: Array<{
      id: number
      token_id: string
      image_url: string | null
      image_preview_url: string | null
      name: string | null
      asset_contract: {
        address: string
        name: string
        schema_name: string
        symbol: string
      }
    }>
  }
  taker: null
  cancelled: boolean
  finalized: boolean
  marked_invalid: boolean
}

export async function loadListings(
  apiRoot: string,
  chainId: number,
  maker: `0x${string}` | undefined,
) {
  if (!maker) {
    return []
  }
  const chainName = getChainName(chainId)
  const headers = detectMainnet(chainId)
    ? { 'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY }
    : {}
  const listings = (
    await axios.get(
      `${apiRoot}/api/v2/orders/${chainName}/seaport/listings?maker=${maker}`,
      { headers },
    )
  ).data.orders

  return await Promise.all(
    listings.map(async (listing: OpenSeaListing) => {
      return {
        orderHash: listing.order_hash,
        currentPrice: `${ethers.formatEther(listing.current_price)} eth`,
        protocolAddress: listing.protocol_address,
        expireTime: listing.expiration_time,
        taker: listing.taker,
        contract: listing.protocol_data.parameters.offer[0].token,
        tokenId: listing.protocol_data.parameters.offer[0].identifierOrCriteria,
        image: listing.maker_asset_bundle.assets[0].image_preview_url,
        name: listing.maker_asset_bundle.assets[0].name,
      }
    }),
  )
}

export function addressPipe(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getChainName = (chainId: number) => {
  switch (chainId) {
    case 137:
      return Chain.Polygon
    case 11155111:
      return Chain.Sepolia
    case 8453:
      return Chain.Base
    case 84532:
      return Chain.BaseSepolia
    default:
      return Chain.Mainnet
  }
}
