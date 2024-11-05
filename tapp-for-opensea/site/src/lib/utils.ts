import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { ethers } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isProd =
  !process.env.NEXT_PUBLIC_DEPLOYMENT_ENV &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export async function loadListings(chain: string, maker: string) {
  const listings = (
    await axios.get(
      `https://testnets-api.opensea.io//api/v2/orders/${chain}/seaport/listings?maker=${maker}`
    )
  ).data.orders;

  return await Promise.all(
    listings.map(async (listing: any) => {
      return {
        orderHash: listing.order_hash,
        currentPrice: `${ethers.formatEther(listing.current_price)} eth`,
        assets: listing.maker_asset_bundle.assets.map((asset: any) => {
          return {
            name: asset.name,
            image: asset.image_url,
            link: asset.permalink.replace(chain, chain.replace("_", "-")),
          };
        }),
      };
    })
  );
}
