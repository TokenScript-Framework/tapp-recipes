import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { Contract, ethers } from "ethers";
import {  base, baseSepolia } from "viem/chains";
import { tokenData } from "@token-kit/onchain";
import { createPublicClient, http, PublicClient } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isProd =
  !process.env.NEXT_PUBLIC_DEPLOYMENT_ENV &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

  const client = createPublicClient({
    chain: isProd?base:baseSepolia, // 根据您的需求选择正确的网络
    transport: http()
  });


interface Token {
    image: string;
    attributes:
    {
        "trait_type": string;
        "value": string | number
    }[];
    name: string;
    description: string;
}


export async function loadListings(chain: string, maker: string) {
  const listings = (
    await axios.get(
      `https://testnets-api.opensea.io//api/v2/orders/${chain}/seaport/listings?maker=${maker}`
    )
  ).data.orders;

  return await Promise.all(
    listings.map(async (listing: any) => {
        let token:Token={
            image: '',
            attributes: [],
            name: '',
            description: 'unknow'}
        try{
        const result = await tokenData(
            client as PublicClient,
            listing.protocol_data.parameters.offer[0].token,
            Number(listing.protocol_data.parameters.offer[0].identifierOrCriteria), { includeTokenMetadata: true },
        );
        if ('tokenMetadata' in result) {
            token = result.tokenMetadata as Token;
        }
        console.log("result",result)
        }catch(error){
                console.log(error)
        }
        
  console.log(listing);
      return {
        orderHash: listing.order_hash,
        currentPrice: `${ethers.formatEther(listing.current_price)} eth`,
        protocolAddress:listing.protocol_address,
        assets: listing.maker_asset_bundle.assets.map(() => {
          return {...token};
        }),
      };
    })

  );
}
