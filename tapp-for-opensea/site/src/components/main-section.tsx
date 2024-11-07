"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "./loading";
import { Chain } from "opensea-js";
import { loadListings } from "@/lib/utils";
import Image from "next/image";
import opensearSVG from "../public/images/opensea.svg"
import { CONTRACT_ADDRESS, SCRIT_ID, VIEWER_URL } from "@/lib/constant";


export type Listing = {
    orderHash: string;
    currentPrice: string;
    protocolAddress: string;
    assets: {
        name: string;
        image: string;
        link: string;
        tokenContract: string;
        tokenId: string;
    }[];
};

export function MainSection() {
    const [isLoadingListings, setIsLoadingListings] = useState(false);
    const [userListings, setUserListings] = useState<Listing[]>([]);

    const { address, isConnected } = useAccount();

    const loadUserListings = useCallback(async () => {
        if (address) {
            setIsLoadingListings(true);

            const listings = await loadListings(Chain.BaseSepolia, address);
            setUserListings(listings);
            setIsLoadingListings(false);
        }
    }, [address]);

    useEffect(() => {
        loadUserListings();
    }, [loadUserListings]);

    const handleShareOnTwitter = (orderHash: string, protocolAddress: string) => {
        const tlink = `${VIEWER_URL}?chain=84532&contract=${CONTRACT_ADDRESS}&tokenId=1&scriptId=${SCRIT_ID}#card=Buy&originId=Token&tokenId=0&orderHash=${orderHash}&protocolAddress=${protocolAddress}`;
        console.log(tlink);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tlink)}`;
        window.open(twitterUrl, "_blank");
    }

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
                            {userListings && userListings.length === 0 ? (
                                <p className="text-gray-700 text-lg">
                                    No listing data. Please access <a href="https://testnets.opensea.io/" target="_blank" className="text-blue-500 cursor underline">Opensea</a> to add.
                                </p>
                            ) : (
                                userListings.map((nft) => {
                                    return (
                                        <Card
                                            key={nft.orderHash}
                                            className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                                        >
                                            <CardHeader className="p-0">
                                                {nft.assets[0].image ? (<img
                                                    src={nft.assets[0].image}
                                                    alt={nft.assets[0].name}
                                                    className="w-full h-72 object-cover rounded-t-lg"
                                                />) : (
                                                    <div className="relative w-full h-72 bg-gray-100 flex items-center justify-center">
                                                        <div className="relative w-1/2 h-1/2">
                                                            <Image
                                                                src={opensearSVG}
                                                                alt="logo"
                                                                fill
                                                                className="rounded-t-lg opacity-20"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                            </CardHeader>
                                            <CardContent className="p-4">
                                                <CardTitle className="text-sm mb-2 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Image src={opensearSVG} alt="logo" width={32} height={32} />
                                                        <a href={nft.assets[0].link} target="blank">
                                                            {nft.assets[0].name}
                                                        </a>
                                                    </div>

                                                    {nft.currentPrice}
                                                </CardTitle>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => handleShareOnTwitter(nft.orderHash, nft.protocolAddress)}
                                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 font-bold text-xl"
                                                    > Share on Twitter
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                }))}
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
