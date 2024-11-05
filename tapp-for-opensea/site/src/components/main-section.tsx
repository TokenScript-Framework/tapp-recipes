/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beer } from "lucide-react";
import { PublicClient } from "viem";
import { Loading } from "./loading";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Chain } from "opensea-js";
import { loadListings } from "@/lib/utils";

export type Listing = {
  orderHash: string;
  currentPrice: string;
  assets: {
    name: string;
    image: string;
    link: string;
  }[];
};

export function MainSection() {
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [connectTimeout, setConnectTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = usePublicClient() as PublicClient;

  const loadUserListings = useCallback(async () => {
    if (address) {
      setIsLoadingListings(true);

      const listings = await loadListings(Chain.BaseSepolia, address);

      setUserListings(listings);
      setIsLoadingListings(false);
    }
  }, [client, address]);

  useEffect(() => {
    loadUserListings();
  }, [loadUserListings]);

  return (
    <div className="container mx-auto p-4">
      <section className="mb-12 text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Share your listings on X!
        </h2>
        <p className="text-xl mb-6 text-gray-700">
          Share your listings on X and make them discoverable to the world.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Your Listings
        </h2>
        {isConnected ? (
          isLoadingListings ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userListings &&
                userListings.map((nft) => {
                  return (
                    <Card
                      key={nft.orderHash}
                      className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <CardHeader className="p-0">
                        <img
                          src={nft.assets[0].image}
                          alt={nft.assets[0].name}
                          className="w-full h-72 object-cover rounded-t-lg"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-xl mb-2 flex items-center">
                          <Beer className="mr-2 text-amber-500" />
                          <a href={nft.assets[0].link} target="blank">
                            {nft.assets[0].name}
                          </a>
                        </CardTitle>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => {
                              const tlink = "";
                              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                tlink
                              )}`;
                              window.open(twitterUrl, "_blank");
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            {nft.currentPrice}
                            <br /> Share on Twitter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )
        ) : (
          <p className="text-gray-700 text-lg">
            Connect your wallet to view your Opensea listings.
          </p>
        )}
      </section>
    </div>
  );
}
