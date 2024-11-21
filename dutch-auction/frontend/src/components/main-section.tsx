/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  CHAIN_ID,
  DUTCH_AUCTION_ABI,
  DUTCH_AUCTION_CONTRACT,
  MORCHI_NFT_CONTRACT,
} from '@/lib/constant';
import { myNfts, MyNftToken } from '@token-kit/onchain';
import { useCallback, useEffect, useState } from 'react';
import { PublicClient, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useReadContracts } from 'wagmi';
import { CreateModal } from './create-modal';
import { Loading } from './loading';

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
  // { [tokenId: string]: onAuction }
  const [auctionStatus, setAuctionStatus] = useState<Record<string, boolean>>(
    {}
  );
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

  const { data, isLoading: isLoadingAuctionStatus } = useReadContracts({
    contracts: nfts.map((token) => ({
      address: DUTCH_AUCTION_CONTRACT,
      abi: DUTCH_AUCTION_ABI,
      functionName: 'auctions',
      args: [MORCHI_NFT_CONTRACT, token.tokenId],
    })),
    query: {
      enabled: isConnected && nfts.length > 0,
    },
  });

  useEffect(() => {
    if (data) {
      const auctionStatus = data.reduce(
        (acc: Record<string, boolean>, { result }: any) => {
          if (result[0] === zeroAddress) return acc;
          // startingTime > 0 && soldPrice === 0
          acc[`${result[0]}-${String(result[1])}`] =
            result[5] > 0 && result[7] === BigInt(0);
          return acc;
        },
        {}
      );

      setAuctionStatus(auctionStatus);
    }
  }, [data]);

  useEffect(() => {
    loadMorchiNFTs();
  }, [loadMorchiNFTs]);

  async function createAuction(nft: MyNftToken) {
    setSelectedNft(nft);
    setIsCreateModalOpen(true);
  }

  async function shareOnTwitter(nft: MyNftToken) {
    const text = 'Want a Morchi NFT, check out this Auction!';
    const url = `https://viewer.tokenscript.org/?chain=${CHAIN_ID}&contract=${MORCHI_NFT_CONTRACT}&tokenId=${nft.tokenId}&scriptId=7738_X#card=Buy`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;

    window.open(twitterLink, '_blank');
  }

  function onCreateModalClose() {
    setIsCreateModalOpen(false);
    setSelectedNft(undefined);
  }

  const isLoading = isLoadingNFTs || isLoadingAuctionStatus;

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
          isLoading ? (
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
                  const onAuction =
                    auctionStatus[
                      `${MORCHI_NFT_CONTRACT}-${String(nft.tokenId)}`
                    ];

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
                        <div className='flex flex-col gap-2 w-full'>
                          <Button
                            onClick={() => createAuction(nft)}
                            className='w-full bg-[rgb(255,127,81)] text-white hover:bg-[rgb(255,150,110)] transition-colors'
                          >
                            {onAuction ? 'Update' : 'Create'} Auction
                          </Button>
                          {onAuction && (
                            <Button
                              onClick={() => shareOnTwitter(nft)}
                              className='w-full bg-[rgb(255,127,81)] text-white hover:bg-[rgb(255,150,110)] transition-colors'
                            >
                              Share on Twitter
                            </Button>
                          )}
                        </div>
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
      {selectedNft && (
        <CreateModal
          nft={selectedNft}
          isOpen={isCreateModalOpen}
          onClose={onCreateModalClose}
        />
      )}
    </main>
  );
}
