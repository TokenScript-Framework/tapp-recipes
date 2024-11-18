/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MORCHI_NFT_CONTRACT } from '@/lib/constant';
import { myNfts, MyNftToken } from '@token-kit/onchain';
import { useCallback, useEffect, useState } from 'react';
import { PublicClient } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { Loading } from './loading';
import { CreateModal } from './create-modal';

export type MorchiMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: number | string }[];
};

export function MainSection() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [nfts, setNfts] = useState<MyNftToken[]>([]);
  const [selectedNft, setSelectedNft] = useState<MyNftToken>();

  const { address, isConnected } = useAccount();
  const client = usePublicClient() as PublicClient;

  const loadMorchiNFTs = useCallback(async () => {
    if (address) {
      setIsLoadingNFTs(true);
      const result = await myNfts({
        client,
        address: MORCHI_NFT_CONTRACT,
        userWallet: address,
        options: {
          includeTokenMetadata: true,
        },
      });
      setNfts(result.tokens);
      setIsLoadingNFTs(false);
    }
  }, [client, address]);

  useEffect(() => {
    loadMorchiNFTs();
  }, [loadMorchiNFTs]);

  async function createAuction(nft: MyNftToken) {
    setSelectedNft(nft);
    setIsCreateModalOpen(true);
  }

  function onCreateModalClose() {
    setIsCreateModalOpen(false);
    setSelectedNft(undefined)
  }

  return (
    <main className='flex-grow container mx-auto px-4 py-12'>
      <section className='text-center mb-16'>
        <h2 className='text-5xl font-bold mb-6 text-[rgb(255,127,81)]'>
          Welcome to Morchi NFT Auction
        </h2>
        <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
          Create auctions for your Morchi NFTs and let the bidding begin! Join
          the vibrant world of digital collectibles.
        </p>
      </section>

      <section>
        <h3 className='text-3xl font-semibold mb-8 text-[rgb(255,127,81)]'>
          Your Morchi NFTs
        </h3>
        {isConnected ? (
          isLoadingNFTs ? (
            <Loading />
          ) : (
            <>
              {nfts.length <= 0 && (
                <p className='text-gray-700 text-lg text-center'>
                  No Morchi NFT detected for the connected wallet
                </p>
              )}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                {nfts.map((nft) => {
                  const metadata = nft.tokenMetadata! as MorchiMetadata;

                  return (
                    <Card
                      key={nft.tokenId}
                      className='bg-[#2A2A2A] border-[#3A3A3A] overflow-hidden'
                    >
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-[rgb(255,127,81)]'>
                          {metadata.name}
                        </CardTitle>
                        <CardDescription className='text-gray-400'>
                          {metadata.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={metadata.image}
                          alt={metadata.name}
                          className='w-full h-64 object-cover rounded-md'
                        />
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() => createAuction(nft)}
                          className='w-full bg-[rgb(255,127,81)] text-white hover:bg-[rgb(255,150,110)] transition-colors'
                        >
                          Create Auction
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </>
          )
        ) : (
          <p className='text-gray-700 text-lg text-center'>
            Connect your wallet to view your Morchi NFTs
          </p>
        )}
      </section>
      <CreateModal
        nft={selectedNft}
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
      />
    </main>
  );
}
