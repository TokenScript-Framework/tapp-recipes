/* eslint-disable @typescript-eslint/no-explicit-any */
import DetailsDialog from '@/components/details-dialog';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Loader from '../components/loader/loader';

const metadata = {
  image:
    'https://resources.smartlayer.network/smart-token-store/images/mooar/suitup/assets/9a50bd8b7b8f9c8472e8237c5b7d41f5.png',
  attributes: [
    {
      trait_type: 'Level',
      value: 0,
      max_value: 30,
    },
    {
      trait_type: 'Rarity',
      value: 'Common',
    },
    {
      trait_type: 'Body',
      value: 'Mooarty STEPN Brown (Common)',
    },
    {
      trait_type: 'Device',
      value: 'Box Grey (Common)',
    },
    {
      trait_type: 'Screen',
      value: 'Game Grey (Common)',
    },
    {
      trait_type: 'Sneaker',
      value: 'Mooarty VR Blue (Common)',
    },
    {
      trait_type: 'Headgear',
      value: 'Mooarty VR Grey (Common)',
    },
    {
      trait_type: 'Character',
      value: 'Mooarty',
    },
    {
      trait_type: 'Background',
      value: '90s kid blue',
    },
  ],
  description: '',
  name: 'MORCHI #65',
  animation_url:
    'https://viewer.tokenscript.org/?viewType=opensea&chain=11155111&contract=0xecD8D3736C6bCE00440bf76db56f032d97121Fc7&tokenId=65',
};

const auction = {
  startPrice: '1.0',
  reservePrice: '0.5',
  currentPrice: '0.8',
  nextPrice: '0.7',
};

// @ts-ignore
export const Buy: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeUntilDrop, setTimeUntilDrop] = useState<number>(3600);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilDrop((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  function onBuy() {
    // TODO: buy tx
  }

  function onViewDetails() {
    setIsDetailsDialogOpen(true);
  }

  function OnMooar() {
    window.open(
      `https://mooar.com/item/${tokenscript.env.CONTRACT_ADDRESS}/${65}`,
      '_blank'
    );
  }

  function onDetailsDialogClose() {
    setIsDetailsDialogOpen(false);
  }

  return (
    <div className='flex flex-col items-start gap-4 w-full p-5'>
      <DetailsDialog
        isOpen={isDetailsDialogOpen}
        onDialogClose={onDetailsDialogClose}
        attributes={metadata.attributes}
      />

      <div className='relative aspect-square border-2 rounded-2xl border-[#FF605F]'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent opacity-50 rounded-2xl' />
        <img
          src={metadata.image}
          alt={metadata.name}
          className='w-full h-full object-contain rounded-2xl'
        />
      </div>

      <div className='grid grid-cols-4 gap-4 text-center'>
        <div className='space-y-1'>
          <div className='text-xs text-gray-400 uppercase'>Starting Price</div>
          <div className='text-3xl font-bold'>{auction.startPrice}</div>
        </div>
        <div className='space-y-1'>
          <div className='text-xs text-gray-400 uppercase'>Reserve Price</div>
          <div className='text-3xl font-bold'>{auction.reservePrice}</div>
        </div>
        <div className='space-y-1'>
          <div className='text-xs text-gray-400 uppercase'>Current Price</div>
          <div className='text-3xl font-bold'>{auction.currentPrice}</div>
        </div>
        <div className='space-y-1'>
          <div className='text-xs text-gray-400 uppercase'>Price Drops</div>
          <div className='text-3xl font-bold'>{formatTime(timeUntilDrop)}</div>
        </div>
      </div>

      <div className='flex w-full gap-4 justify-around'>
        <Button
          onClick={onBuy}
          className='min-w-48 rounded-lg border-none hover:from-[#FF9C5A] hover:to-[#FF706F] bg-gradient-to-r from-[#FF8C4A] from-10% to-[#FF605F] to-90%'
        >
          Buy
        </Button>
        <Button
          onClick={onViewDetails}
          className='min-w-48 rounded-lg border-none hover:from-[#FF9C5A] hover:to-[#FF706F] bg-gradient-to-r from-[#FF8C4A] from-10% to-[#FF605F] to-90%'
        >
          Details
        </Button>
        <Button
          variant='outline'
          className='rounded-lg p-2 bg-transparent border-gray-400 hover:border-gray-400 hover:bg-gray-400'
          onClick={OnMooar}
        >
          <img
            className='h-8 w-8'
            src='https://resources.smartlayer.network/smart-token-store/images/morchi/landingpage/mooar_logo.svg'
            alt='logo'
          />
        </Button>
      </div>
      <Loader show={loading} />
    </div>
  );
};
