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
import {
  DUTCH_AUCTION_ABI,
  DUTCH_AUCTION_CONTRACT,
  MORCHI_NFT_CONTRACT,
} from '@/lib/constant';
import { erc721Abi, parseEther } from 'viem';
import { Button } from './ui/button';
import { MyNftToken } from '@token-kit/onchain';
import { MorchiMetadata } from './main-section';
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { Loading } from './loading';

const defaultAuctionData = {
  startTime: '',
  startingPrice: '',
  reservePrice: '',
  dropRatePerHour: '',
};

const defaultFieldErrors = {
  startingPrice: '',
  reservePrice: '',
  startTime: '',
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
  const [isCreating, setIsCreating] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);
  const [auctionData, setAuctionData] = useState(defaultAuctionData);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState(defaultFieldErrors);

  const {
    writeContract: approve,
    data: approveTxHash,
    isError: isApproveError,
  } = useWriteContract();
  const {
    writeContract: createAuction,
    data: createAuctionTxHash,
    isError: isCreateAuctionError,
  } = useWriteContract();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuctionData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...fieldErrors };

    if (!auctionData.startTime) {
      newErrors.startTime = 'Start time is required';
      isValid = false;
    }

    if (
      !auctionData.startingPrice ||
      parseFloat(auctionData.startingPrice) <= 0
    ) {
      newErrors.startingPrice = 'Starting price must be a positive number';
      isValid = false;
    }

    if (
      !auctionData.reservePrice ||
      parseFloat(auctionData.reservePrice) <= 0
    ) {
      newErrors.reservePrice = 'Reserve price must be a positive number';
      isValid = false;
    }

    if (
      !auctionData.dropRatePerHour ||
      parseFloat(auctionData.dropRatePerHour) <= 0
    ) {
      newErrors.dropRatePerHour = 'Drop rate must be a positive number';
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleCreateAuction = async () => {
    if (validateForm()) {
      setIsCreating(true);
    }
  };

  const { data: approvedTo } = useReadContract({
    abi: erc721Abi,
    address: MORCHI_NFT_CONTRACT,
    functionName: 'getApproved',
    args: [nft!.tokenId],
    query: {
      enabled: isCreating,
    },
  });

  useEffect(() => {
    if (!approvedTo || !isCreating) return;

    if (approvedTo === DUTCH_AUCTION_CONTRACT) {
      setHasApproved(true);
    } else {
      approve({
        abi: erc721Abi,
        address: MORCHI_NFT_CONTRACT,
        functionName: 'approve',
        args: [DUTCH_AUCTION_CONTRACT, nft.tokenId],
      });
    }
  }, [approve, approvedTo, isCreating, nft]);

  const { data: approveReceipt, isError: isApproveReceiptError } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
      confirmations: 1,
      query: {
        enabled: !!approveTxHash && isCreating,
      },
    });

  useEffect(() => {
    if (approveReceipt) setHasApproved(true);
  }, [approveReceipt]);

  useEffect(() => {
    if (isCreating && hasApproved) {
      createAuction({
        abi: DUTCH_AUCTION_ABI,
        address: DUTCH_AUCTION_CONTRACT,
        functionName: 'createAuction',
        args: [
          MORCHI_NFT_CONTRACT,
          nft.tokenId,
          parseEther(auctionData.startingPrice),
          parseEther(auctionData.reservePrice),
          BigInt(Math.floor(new Date(auctionData.startTime).getTime() / 1000)),
          parseEther(auctionData.dropRatePerHour),
        ],
      });
    }
  }, [hasApproved, auctionData, createAuction, nft, isCreating]);

  const { data: createAuctionReceipt, isError: isCreateAuctionReceiptError } =
    useWaitForTransactionReceipt({
      hash: createAuctionTxHash,
      confirmations: 1,
      query: {
        enabled: !!createAuctionTxHash && isCreating,
      },
    });

  useEffect(() => {
    if (!isCreating) return;

    if (isApproveError || isApproveReceiptError) {
      setError('Error approving NFT. Please try again.');
      setIsCreating(false);
    }

    if (isCreateAuctionError || isCreateAuctionReceiptError) {
      setError('Error creating auction. Please try again.');
      setIsCreating(false);
    }

    if (createAuctionReceipt) {
      setIsCreating(false);
    }
  }, [
    createAuctionReceipt,
    isApproveError,
    isApproveReceiptError,
    isCreateAuctionError,
    isCreateAuctionReceiptError,
    isCreating,
  ]);

  useEffect(() => {
    if (isOpen) {
      setAuctionData({
        ...defaultAuctionData,
        startTime: formattedNow(),
      });
    } else {
      setError('');
      setIsCreating(false);
      setHasApproved(false);
      setFieldErrors(defaultFieldErrors);
    }
  }, [isOpen]);

  const metadata = nft.tokenMetadata! as MorchiMetadata;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-[#2A2A2A] border-[#3A3A3A] text-white'>
        {isCreating && (
          <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <Loading />
          </div>
        )}
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
            <div className='col-span-3 flex flex-col gap-2'>
              <div className='flex gap-2'>
                <Input
                  id='startTime'
                  name='startTime'
                  type='datetime-local'
                  value={auctionData.startTime}
                  onChange={handleInputChange}
                  className='flex-grow bg-[#3A3A3A] border-[#4A4A4A] text-white w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-8'
                  required
                />
              </div>
              {fieldErrors.startTime && (
                <p className='text-red-500 text-sm'>{fieldErrors.startTime}</p>
              )}
            </div>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='startingPrice' className='text-right'>
              Starting Price (ETH)
            </Label>
            <div className='col-span-3 flex flex-col gap-2'>
              <Input
                id='startingPrice'
                name='startingPrice'
                type='number'
                min='0'
                step='0.01'
                value={auctionData.startingPrice}
                onChange={handleInputChange}
                className='bg-[#3A3A3A] border-[#4A4A4A] text-white'
                required
              />
              {fieldErrors.startingPrice && (
                <p className='text-red-500 text-sm'>
                  {fieldErrors.startingPrice}
                </p>
              )}
            </div>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='reservePrice' className='text-right'>
              Reserve Price (ETH)
            </Label>
            <div className='col-span-3 flex flex-col gap-2'>
              <Input
                id='reservePrice'
                name='reservePrice'
                type='number'
                min='0'
                step='0.01'
                value={auctionData.reservePrice}
                onChange={handleInputChange}
                className='bg-[#3A3A3A] border-[#4A4A4A] text-white'
                required
              />
              {fieldErrors.reservePrice && (
                <p className='text-red-500 text-sm'>
                  {fieldErrors.reservePrice}
                </p>
              )}
            </div>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='dropRatePerHour' className='text-right'>
              Drop Rate (ETH/hour)
            </Label>
            <div className='col-span-3 flex flex-col gap-2'>
              <Input
                id='dropRatePerHour'
                name='dropRatePerHour'
                type='number'
                min='0'
                step='0.01'
                value={auctionData.dropRatePerHour}
                onChange={handleInputChange}
                className='bg-[#3A3A3A] border-[#4A4A4A] text-white'
                required
              />
              {fieldErrors.dropRatePerHour && (
                <p className='text-red-500 text-sm'>
                  {fieldErrors.dropRatePerHour}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          {createAuctionReceipt && (
            <p className='text-green-600 mt-2 text-center font-semibold'>
              Auction created successfully!
            </p>
          )}
          {error && (
            <p className='text-red-600 mt-2 text-center font-semibold'>
              {error}
            </p>
          )}
          <Button
            onClick={handleCreateAuction}
            className='bg-[rgb(255,127,81)] text-white hover:bg-[rgb(255,150,110)] transition-colors'
          >
            Create Auction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
