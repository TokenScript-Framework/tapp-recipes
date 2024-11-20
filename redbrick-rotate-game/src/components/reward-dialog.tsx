/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { getRewards } from '@/lib/redbrickApi';
import { getSLNRewards } from '@/lib/backendApi';

function defaultRewards() {
  return {
    badge: { count: 0 },
    points: { count: 0 },
    bric: { count: 0 },
  };
}

const defaultSlnRewards = {
  sln: 0,
};

const itemIcons: Record<string, string> = {
  badge: 'badge',
  points: 'points',
  bric: 'brick',
};

const itemDesc: Record<string, string> = {
  badge: 'BADGES',
  points: 'POINTS',
  bric: 'BRIC ROLE',
};

interface RewardDialogProps {
  isOpen: boolean;
  onDialogClose: () => void;
  authToken: string;
}

type Rewards = Record<string, { count: number; lastUpdate?: Date }>;

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const month = pad(date.getMonth() + 1); // Months are 0-indexed
  const day = pad(date.getDate());

  return `${hours}:${minutes}:${seconds} | ${month}-${day}`;
}

export default function RewardDialog({
  isOpen,
  onDialogClose,
  authToken,
}: RewardDialogProps) {
  const [rewards, setRewards] = useState<Rewards>(defaultRewards());
  const [slnRewards, setSlnRewards] = useState<{
    sln: number;
    lastRewardedAt?: number;
  }>(defaultSlnRewards);

  const loadRewards = useCallback(async () => {
    const result = await getRewards(authToken);

    const rewards = result.data.reduce((acc: Rewards, item: any) => {
      const type = ['p5', 'p10', 'p20'].includes(item.type)
        ? 'points'
        : item.type;

      const reward = acc[type];

      reward.count += parseInt(item.amount);
      const lastUpdate = new Date(item.lastSpinAt);
      if (!reward.lastUpdate || lastUpdate > reward.lastUpdate)
        reward.lastUpdate = lastUpdate;

      acc[type] = reward;
      return acc;
    }, defaultRewards());

    setRewards(rewards);
  }, [authToken]);

  const loadSLNRewards = useCallback(async () => {
    const result = await getSLNRewards();
    setSlnRewards(result);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRewards();
      loadSLNRewards();
    }
  }, [loadRewards, loadSLNRewards, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className='flex flex-col gap-0 justify-start text-white py-0 px-2 w-full h-dvh bg-center bg-cover bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/background.png")] border-none'>
        <DialogTitle className='h-0'></DialogTitle>
        <div className='flex flex-col items-center gap-1 w-full z-50'>
          <div className='flex justify-around items-center w-full h-20 bg-center bg-[length:100%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/dialog-title-bg.png")]'>
            <img
              className='max-w-[72px] max-h-12 mt-2 cursor-pointer'
              onClick={onDialogClose}
              src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/back-btn.png'
              alt='back-btn'
            />
            <div className='font-bold text-2xl tracking-[1rem]'>REWARD</div>
          </div>
          <div className='flex flex-col items-center -mt-2'>
            <img
              className='max-w-24'
              src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/rewards-icon.png'
              alt='rewards-icon'
            />
            <div className='-mt-4'>Reward assets you collect</div>
          </div>
          <div className='flex flex-col items-center gap-1 w-full pt-4 px-20 h-[430px] bg-center bg-[length:90%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/dialog-bg.png")]'>
            <div className='flex gap-4'>
              {Object.entries(rewards).map(([type, { count, lastUpdate }]) => (
                <div className='flex flex-col gap-1 items-center'>
                  <div className='flex flex-col self-start gap-1'>
                    <div className='bg-black/70 rounded-sm text-[0.5rem] w-fit px-1'>
                      Update
                    </div>
                    <div className='text-[#64DA4C] text-xs'>
                      {lastUpdate ? formatDate(lastUpdate) : '00:00:00 | 00-00'}
                    </div>
                  </div>
                  <div className='bg-gray-400 rounded-xl text-center'>
                    <img
                      className='w-24 h-24'
                      src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/${itemIcons[type]}-icon.png`}
                      alt='item-icon'
                    />
                    <div className='text-md font-bold flex justify-center items-center min-h-8'>
                      {itemDesc[type]}
                    </div>
                  </div>
                  <div className='text-2xl font-bold'>{count}</div>
                </div>
              ))}
            </div>
            <div className='flex flex-col gap-1 self-start items-center'>
              <div className='flex flex-col self-start gap-1'>
                <div className='bg-black/70 rounded-sm text-[0.5rem] w-fit px-1'>
                  Update
                </div>
                <div className='text-[#64DA4C] text-xs'>
                  {slnRewards.lastRewardedAt
                    ? formatDate(new Date(slnRewards.lastRewardedAt))
                    : '00:00:00 | 00-00'}
                </div>
              </div>
              <div className='bg-gray-400 rounded-xl text-center'>
                <img
                  className='w-24 h-24'
                  src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/sln-token.png`}
                  alt='item-icon'
                />
                <div className='text-md font-bold flex justify-center items-center min-h-8'>
                  SLN
                </div>
              </div>
              <div className='text-2xl font-bold'>{slnRewards.sln}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
