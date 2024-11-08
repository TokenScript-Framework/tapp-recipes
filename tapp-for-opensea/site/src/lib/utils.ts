import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { ethers } from "ethers";
import { base, baseSepolia, sepolia } from "viem/chains";
import { tokenData } from "@token-kit/onchain";
import { createPublicClient, http, PublicClient } from "viem";
import { isProd, OPENSEA_API } from "./constant";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


const client = createPublicClient({
    chain: isProd ? base : baseSepolia,
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
    const headers = isProd
        ? { 'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY }
        : {};
    const listings = (
        await axios.get(
            `${OPENSEA_API}/api/v2/orders/${chain}/seaport/listings?maker=${maker}`, { headers }
        )
    ).data.orders;

    return await Promise.all(
        listings.map(async (listing: any) => {
            let token: Token = {
                image: '',
                attributes: [],
                name: '',
                description: 'unknow'
            }
            try {
                const result = await tokenData(
                    client as PublicClient,
                    listing.protocol_data.parameters.offer[0].token,
                    Number(listing.protocol_data.parameters.offer[0].identifierOrCriteria), { includeTokenMetadata: true },
                );
                
                if ('tokenMetadata' in result) {
                    token = result.tokenMetadata as Token;
                }
                console.log("result", result)
            } catch (error) {
                console.log(error)
            }

            console.log(listing);
            return {
                orderHash: listing.order_hash,
                currentPrice: `${ethers.formatEther(listing.current_price)} eth`,
                protocolAddress: listing.protocol_address,
                expireTime: listing.expiration_time,
                taker:listing.taker,
                assets: listing.maker_asset_bundle.assets.map(() => {
                    return { ...token };
                }),
            };
        })

    );
}

export function  addressPipe(address:string){
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}
