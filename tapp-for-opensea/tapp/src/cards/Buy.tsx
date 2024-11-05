import React, { useState, useEffect, useCallback } from "react";
import Loader from "../components/loader/loader";
import { ethers } from "ethers";
import axios from "axios";
import { Seaport } from "@opensea/seaport-js";
import { OPENSEA_CONDUIT_KEY } from "@opensea/seaport-js/lib/constants";

async function loadListings() {
  const listings = (
    await axios.get(
      `https://testnets-api.opensea.io//api/v2/orders/base_sepolia/seaport/listings?maker=0x8b82b76d16AB17564872486005724a2F40F8a376`
    )
  ).data.orders;

  return await Promise.all(
    listings.map(async (listing: any) => {
      return {
        orderHash: listing.order_hash,
        currentPrice: `${ethers.formatEther(listing.current_price)} eth`,
        protocolAddress: listing.protocol_address,
        protocolData: listing.protocol_data,
        assets: listing.maker_asset_bundle.assets.map((asset: any) => {
          return {
            name: asset.name,
            image: asset.image_url,
            link: asset.permalink.replace("base_sepolia", "base-sepolia"),
          };
        }),
      };
    })
  );
}

async function fulfilLsting(order: any) {
  const result = (
    await axios.post(
      "https://testnets-api.opensea.io/api/v2/listings/fulfillment_data",
      {
        listing: {
          hash: "0x952e0cc9b847849345b3b9de3f796779cd96650d6c7858e17763fec00c57d29a",
          chain: "base_sepolia",
          protocol_address: "0x0000000000000068f116a894984e2db1123eb395",
        },
        fulfiller: { address: "0x851438Ecb37FAe596DcD49bDe643D170F3aa225B" },
      }
    )
  ).data;
  const signature = result.fulfillment_data.orders[0].signature;
  const protocolData = order.protocolData;

  console.log("Input Data", protocolData);

  protocolData.signature = signature;
  const checksummedProtocolAddress = ethers.getAddress(
    "0x0000000000000068f116a894984e2db1123eb395"
  );

  const provider = new ethers.BrowserProvider(window.ethereum);
  const seaport = new Seaport(await provider.getSigner(), {
    overrides: {
      contractAddress: checksummedProtocolAddress,
      seaportVersion: "1.6",
      defaultConduitKey: OPENSEA_CONDUIT_KEY,
    },
  });
  const { executeAllActions } = await seaport.fulfillOrder({
    order: protocolData,
    accountAddress: await (await provider.getSigner()).getAddress(),
  });
  const transaction = await executeAllActions();
}

// @ts-ignore
export const Buy: React.FC = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>();

  // const loadOrder = useCallback(async () => {
  //   if (token) {
  //     const openseaSDK = new OpenSeaSDK(
  //       await new ethers.BrowserProvider(window.ethereum, 84532).getSigner(),
  //       {
  //         chain: Chain.BaseSepolia,
  //         apiKey: "YOUR_API_KEY",
  //       }
  //     );

  //     return await openseaSDK.api.getOrder({
  //       side: OrderSide.LISTING,
  //       protocol: "seaport",
  //       assetContractAddress: token.contractAddress,
  //       tokenId: token.tokenId,
  //     });
  //   }
  // }, [token]);

  useEffect(() => {
    setLoading(false);
    loadListings().then((orders) => {
      setOrder(orders[0]);
      fulfilLsting(orders[0]);
    });
  }, [loadListings]);

  return (
    <div>
      {order && (
        <div>
          <h3>Listing</h3>
          <p>Token: {JSON.stringify(token)}</p>
          <p>Order: {JSON.stringify(order)}</p>
          {/* <button onClick={}>Buy</button> */}
        </div>
      )}
      <Loader show={loading} />
    </div>
  );
};
