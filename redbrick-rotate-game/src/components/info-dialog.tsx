'use client';

import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

const itemIcons: Record<string, string> = {
  badge: 'badge',
  p20: 'points',
  p10: 'points',
  p5: 'points',
  bric: 'brick',
};

const itemDesc: Record<string, string> = {
  badge: 'BADGES',
  p20: 'POINTS',
  p10: 'POINTS',
  p5: 'POINTS',
  bric: 'BRIC ROLE',
};

interface InfoDialogProps {
  isOpen: boolean;
  onDialogClose: () => void;
  error?: string;
  spinResult?: {
    rbRewardType: string;
    rbRewardAmount: number;
    stlRewardAmount: number;
  };
}

export default function InfoDialog({
  isOpen,
  onDialogClose,
  error,
  spinResult,
}: InfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className='flex flex-col justify-center w-full h-dvh bg-transparent backdrop-blur-xl border-none'>
        <DialogTitle></DialogTitle>
        {error && (
          <div className='flex flex-col gap-4 text-white'>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}
        {spinResult && (
          <div className='flex flex-col text-center items-center text-white'>
            <div className='text-xl font-bold tracking-[1.5rem] ml-6'>
              CONGRATS
            </div>
            <div className='text-5xl font-bold my-2'>YOU WON</div>
            <div className='flex gap-4 items-center'>
              <div className='bg-gray-400 p-1 rounded-xl'>
                <img
                  className='w-36 h-36'
                  src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/${
                    itemIcons[spinResult.rbRewardType]
                  }-icon.png`}
                  alt='item-icon'
                />
                <div className='text-2xl font-bold'>
                  {spinResult.rbRewardAmount}
                </div>
                <div className='text-md font-bold'>
                  {itemDesc[spinResult.rbRewardType]}
                </div>
              </div>
              {!!spinResult.stlRewardAmount && (
                <>
                  <div className='text-2xl font-bold text-white'>+</div>
                  <div className='bg-gray-400 px-[14px] pt-[14px] pb-1 rounded-xl'>
                    <img
                      className='w-32 h-32 mb-[6px]'
                      src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/sln-token.png'
                      alt='sln-token'
                    />
                    <div className='text-2xl font-bold'>
                      {spinResult.stlRewardAmount}
                    </div>
                    <div className='text-md font-bold'>$SLN</div>
                  </div>
                </>
              )}
            </div>
            <img
              className='max-w-80 mt-[-90px]'
              src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/reward-base.png`}
              alt='reward-base'
            />
            <div className='flex flex-col items-center -mt-24'>
              {spinResult.rbRewardType === 'bric' && (
                <div className='flex gap-2 max-w-80 text-left'>
                  <span>
                    <Info width={16} />
                  </span>
                  <span>
                    BRIC Role reward can only be distributed with
                    immigration-completed accounts.
                  </span>
                </div>
              )}
              {spinResult.stlRewardAmount > 0 && (
                <div className='flex gap-2 max-w-80 text-left'>
                  <span>
                    <Info width={16} />
                  </span>
                  <span>
                    Transfer of $SLN is processing and will arrive shortly.
                  </span>
                </div>
              )}
              <img
                className='max-w-64 cursor-pointer'
                onClick={onDialogClose}
                src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/confirm-btn.png`}
                alt='confirm'
              />
            </div>
            <img
              className='max-w-36'
              src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/logo.png'
              alt='logo'
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
