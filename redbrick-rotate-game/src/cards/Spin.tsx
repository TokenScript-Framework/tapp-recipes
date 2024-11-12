/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import Loader from '../components/loader/loader';
import { getStlGameInfo, spin } from '@/lib/backendApi';
import { buySpin, joinGame, spinSignature } from '@/lib/spinService';
import Spinner from '@/components/spinner';
import {
  getGameStatus,
  getRemainingPool,
  getUserGameInfo,
} from '@/lib/redbrickApi';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import CountDown from '@/components/count-down';

const itemIndexByType: Record<string, number> = {
  badge: 1,
  p20: 2,
  p10: 3,
  p5: 4,
  bric: 5,
};

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

// @ts-ignore
export const Spin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [itemIndex, setItemIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [buttonImageIndex, setButtonImageIndex] = useState(0);
  const [authToken, setAuthToken] = useState('');
  const [blockingMessage, setBlockingMessage] = useState('');
  const [spinResult, setSpinResult] = useState<any>();
  const [userInfo, setUserInfo] = useState<any>();
  const [stlGameInfo, setStlGameInfo] = useState<any>();
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(false);
    async function run() {
      const eventStatus = await getGameStatus();
      if (eventStatus.data.isComing) {
        setBlockingMessage(`Coming Soon (${eventStatus.data.open})`);
      } else if (eventStatus.data.isEnd) {
        setBlockingMessage(`Event Ended (${eventStatus.data.close})`);
      }
    }

    run();
  }, []);

  async function onLogin() {
    const joinResponse = await joinGame();
    setAuthToken(joinResponse.data.authInfo.accessToken);
  }

  const loadGameInfo = useCallback(async () => {
    if (!authToken) return;
    const remainingPool = await getRemainingPool(authToken);
    if (remainingPool <= 0) {
      setBlockingMessage(
        'The total global spin pool is reached. Please spin tomorrow!'
      );
      return;
    }
    const userInfo = await getUserGameInfo(authToken);
    setUserInfo(userInfo);
    const stlGameInfo = await getStlGameInfo();
    setStlGameInfo(stlGameInfo);
  }, [authToken]);

  useEffect(() => {
    loadGameInfo();
  }, [loadGameInfo]);

  const isSpinDisabled =
    !authToken || // not logged in
    isSpinning || // current in spinning
    userInfo?.data?.inventory?.availableSpin <= 0; // user daily cap reached

  async function onSpin() {
    if (isSpinDisabled) return;

    setButtonImageIndex(4); // button pressed down
    setTimeout(() => setButtonImageIndex(0), 300);

    try {
      setIsSpinning(true);
      const spinSignatureResponse = await spinSignature(authToken);
      const hash = await buySpin(spinSignatureResponse);
      const result = await spin(
        hash,
        spinSignatureResponse.data.nonce,
        authToken
      );

      setItemIndex(itemIndexByType[result.rbRewardType]);
      setSpinResult(result);
      await loadGameInfo();
    } catch (e: any) {
      setError('Failed to spin, please try again later.');
      setIsDialogOpen(true);
    } finally {
      setIsSpinning(false);
    }
  }

  function onDialogClose() {
    setIsDialogOpen(false);
    setError('');
    setSpinResult(undefined);
  }

  function onSpinEnd() {
    if (spinResult) {
      setIsDialogOpen(true);
    }
  }

  let messageOrButton;
  if (blockingMessage) {
    messageOrButton = (
      <div className='absolute max-w-80 text-center text-xl backdrop-blur-xl text-white font-bold bottom-16 border p-4 rounded-xl'>
        {blockingMessage}
      </div>
    );
  } else if (authToken) {
    messageOrButton = (
      <>
        <img
          className={cn(
            '-mt-36 max-w-48',
            isSpinDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
          onClick={onSpin}
          src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-button_${buttonImageIndex}.png`}
          alt='spin-button'
        />
        <img
          className='max-w-24 bottom-4 absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/button-display.png'
          alt='button-display'
        />
        <div className='absolute bottom-4 flex gap-2 z-20 text-white'>
          <img
            className='max-w-4'
            src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
            alt='spin-icon'
          />
          <div>
            {userInfo
              ? `${userInfo.data.inventory.availableSpin}/${userInfo.data.inventory.totalSpinDaily}`
              : '-/-'}
          </div>
        </div>
      </>
    );
  } else {
    messageOrButton = (
      <img
        className='-mt-32 max-w-64 cursor-pointer'
        onClick={onLogin}
        src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/login-btn.png'
        alt='login'
      />
    );
  }

  return (
    <div className='w-full h-dvh bg-center bg-cover bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/background.png")]'>
      <Dialog open={isDialogOpen} onOpenChange={onDialogClose}>
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
                {spinResult.stlRewardAmount && (
                  <>
                    <div className='text-2xl font-bold text-white'>+</div>
                    <div className='bg-gray-400 p-1 rounded-xl'>
                      <img
                        className='w-36 h-36'
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
                  <div className='flex max-w-80'>
                    <Info />
                    BRIC Role reward can only be distributed with
                    immigration-completed accounts.
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
                className='max-w-40'
                src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/logo.png'
                alt='logo'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className='flex flex-col items-center overflow-hidden relative'>
        <img
          className='mt-4 max-w-32'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/logo.png'
          alt='logo'
        />
        <img
          className='-mt-8 min-w-[650px]'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/machine-body.png'
          alt='machine-body'
        />
        <div className='top-[456px] absolute'>
          <CountDown />
        </div>
        {messageOrButton}
        <img
          className='max-w-[19rem] top-[158px] absolute'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/cover.png'
          alt='cover'
        />
        <div className='max-w-52 top-[206px] absolute'>
          <Spinner
            isSpinning={isSpinning}
            itemIndex={itemIndex}
            onSpinEnd={onSpinEnd}
          />
        </div>
        <img
          className='max-w-16 top-[154px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/arrow.png'
          alt='arrow'
        />
        <img
          className='max-w-16 top-[278px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/pin.png'
          alt='pin'
        />
      </div>
      {authToken && stlGameInfo && (
        <div className='absolute text-sm w-full bottom-0 rounded-b-md bg-[#0E1D3D] flex justify-around items-center gap-4 text-white px-2'>
          {stlGameInfo.availableSLNRewards > 0 ? (
            <>
              <div>$SLN Rewards</div>
              <div>
                Pool:{' '}
                <span className='font-semibold text-base'>
                  {stlGameInfo.availableSLNRewards}/
                  {stlGameInfo.totalSLNRewards}
                </span>
              </div>
              <div>
                Next Reward:{' '}
                <span className='font-semibold text-base'>
                  {stlGameInfo.unrewardedSpinCount}/10
                </span>
              </div>
            </>
          ) : (
            <div>All $SLN Rewards have been claimed</div>
          )}
        </div>
      )}
      <Loader show={loading} />
      <img
        className='hidden'
        src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-button_4.png`}
        alt='spin-button-eager-load'
      />
    </div>
  );
};
