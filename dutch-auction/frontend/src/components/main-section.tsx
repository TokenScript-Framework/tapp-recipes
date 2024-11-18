/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Placeholder function to get user's Morchi NFTs
const getMorchiNFTs = () => {
  // This would be replaced with actual logic to fetch user's Morchi NFTs
  return [
    {
      id: 1,
      name: 'Morchi #1',
      description: 'A cute Morchi',
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 2,
      name: 'Morchi #2',
      description: 'An adventurous Morchi',
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 3,
      name: 'Morchi #3',
      description: 'A sleepy Morchi',
      image: '/placeholder.svg?height=200&width=200',
    },
  ];
};

export default function MorchiAuctionDapp() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState(getMorchiNFTs());

  // Placeholder function to create an auction
  async function createAuction(tokenId: number) {
    console.log(`Creating auction for token ${tokenId}`);
    // Implement auction creation logic here
  };

  return (
    <main className='flex-grow container mx-auto px-4 py-12'>
      <section className='text-center mb-16'>
        <h2 className='text-5xl font-bold mb-6 text-[rgb(255,127,81)]'>
          Welcome to Morchi NFT Dutch Auction
        </h2>
        <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
          Create auctions for your Morchi NFTs and let the bidding begin! Join
          the vibrant world of digital collectibles.
        </p>
      </section>

      {isConnected && (
        <section>
          <h3 className='text-3xl font-semibold mb-8 text-[rgb(255,127,81)]'>
            Your Morchi NFTs
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {nfts.map((nft) => (
              <Card
                key={nft.id}
                className='bg-[#2A2A2A] border-[#3A3A3A] overflow-hidden'
              >
                <CardHeader className='pb-2'>
                  <CardTitle className='text-[rgb(255,127,81)]'>
                    {nft.name}
                  </CardTitle>
                  <CardDescription className='text-gray-400'>
                    {nft.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className='w-full h-48 object-cover rounded-md'
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => createAuction(nft.id)}
                    className='w-full bg-[rgb(255,127,81)] text-white hover:bg-[rgb(255,150,110)] transition-colors'
                  >
                    Create Auction
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
