import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DUTCH_AUCTION_CONTRACT } from '@/lib/constant';
import { TransactionReceipt } from 'viem';
import { Button } from './ui/button';
import { MyNftToken } from '@token-kit/onchain';
import { MorchiMetadata } from './main-section';

const defaultAuctionData = {
  startTime: '',
  startingPrice: '',
  reservePrice: '',
  dropRatePerHour: '',
};

function formattedNow() {
  const date = new Date();
  const padZero = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1); // Months are 0-indexed
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CreateModal({
  nft,
  isOpen,
  onClose,
}: {
  nft: MyNftToken;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [auctionData, setAuctionData] = useState(defaultAuctionData);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuctionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAuction = () => {
    if (nft !== null) {
      // TODO create auction tx
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAuctionData({
        ...defaultAuctionData,
        startTime: formattedNow(),
      });
    } else {
      setReceipt(undefined);
      setError('');
    }
  }, [isOpen]);

  if (!nft) return null;

  const metadata = nft.tokenMetadata! as MorchiMetadata;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-[#2A2A2A] border-[#3A3A3A] text-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-[rgb(255,127,81)]'>
            Create Auction for {metadata.name}
          </DialogTitle>
          <DialogDescription className='text-gray-300'>
            Set the parameters for your Dutch auction below.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='startTime' className='text-right'>
              Start Time
            </Label>
            <Input
              id='startTime'
              name='startTime'
              type='datetime-local'
              value={auctionData.startTime}
              onChange={handleInputChange}
              className='col-span-3 bg-[#3A3A3A] border-[#4A4A4A] text-white w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-8'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='startingPrice' className='text-right'>
              Starting Price (ETH)
            </Label>
            <Input
              id='startingPrice'
              name='startingPrice'
              type='number'
              min='0'
              step='0.01'
              value={auctionData.startingPrice}
              onChange={handleInputChange}
              className='col-span-3 bg-[#3A3A3A] border-[#4A4A4A] text-white'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='reservePrice' className='text-right'>
              Reserve Price (ETH)
            </Label>
            <Input
              id='reservePrice'
              name='reservePrice'
              type='number'
              min='0'
              step='0.01'
              value={auctionData.reservePrice}
              onChange={handleInputChange}
              className='col-span-3 bg-[#3A3A3A] border-[#4A4A4A] text-white'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='dropRatePerHour' className='text-right'>
              Drop Rate (ETH/hour)
            </Label>
            <Input
              id='dropRatePerHour'
              name='dropRatePerHour'
              type='number'
              min='0'
              step='0.01'
              value={auctionData.dropRatePerHour}
              onChange={handleInputChange}
              className='col-span-3 bg-[#3A3A3A] border-[#4A4A4A] text-white'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateAuction}
            className='bg-[rgb(255,127,81)] text-white hover:bg-[rgb(255,150,110)] transition-colors'
          >
            Create Auction
          </Button>
          {receipt && (
            <p className='text-green-600 mt-2 text-center font-semibold'>
              Auction created successfully!
            </p>
          )}
          {error && (
            <p className='text-red-600 mt-2 text-center font-semibold'>
              Error creating auction. Please try again.
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
