/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className='w-full'>
      <h2 className='text-xl font-bold'>Morchi Auction</h2>
      <div className='space-y-6'>
        <div className='relative aspect-square'>
          <div className='absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent opacity-50' />
          <img
            src={metadata.image}
            alt={metadata.name}
            className='w-full h-full object-contain'
          />
        </div>

        <div className='grid grid-cols-4 gap-4 text-center'>
          <div className='space-y-1'>
            <div className='text-3xl font-bold'>{auction.startPrice}</div>
            <div className='text-xs text-gray-400 uppercase'>
              Starting Price
            </div>
          </div>
          <div className='space-y-1'>
            <div className='text-3xl font-bold'>{auction.reservePrice}</div>
            <div className='text-xs text-gray-400 uppercase'>Reserve Price</div>
          </div>
          <div className='space-y-1'>
            <div className='text-3xl font-bold'>{auction.currentPrice}</div>
            <div className='text-xs text-gray-400 uppercase'>Current Price</div>
          </div>
          <div className='space-y-1'>
            <div className='text-3xl font-bold'>{auction.nextPrice}</div>
            <div className='text-xs text-gray-400 uppercase'>Next Price</div>
            <div className='text-sm text-gray-400'>
              {formatTime(timeUntilDrop)}
            </div>
          </div>
        </div>

        <div className='text-center text-lg'>
          {metadata.name} starting at 18k $GMT
        </div>
      </div>

      <div className='flex gap-4 justify-center'>
        <Button onClick={onBuy} className='bg-blue-600 hover:bg-blue-700'>
          Buy Now
        </Button>
        <Button
          variant='outline'
          className='border-gray-700 hover:bg-gray-800'
          onClick={() => window.open('/', '_blank')}
        >
          <ExternalLink className='w-4 h-4 mr-2' />
          View on MOOAR
        </Button>
      </div>
      <Loader show={loading} />
    </div>
  );
};
