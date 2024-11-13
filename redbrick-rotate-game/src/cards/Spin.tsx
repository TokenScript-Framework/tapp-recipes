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
import { cn } from '@/lib/utils';
import CountDown from '@/components/count-down';
import InfoDialog from '@/components/info-dialog';
import ExtraDialog from '@/components/extra-dialog';

const itemIndexByType: Record<string, number> = {
  badge: 1,
  p20: 2,
  p10: 3,
  p5: 4,
  bric: 5,
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
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  const [isExtraDialogOpen, setIsExtraDialogOpen] = useState(false);

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
      setIsInfoDialogOpen(true);
    } finally {
      setIsSpinning(false);
    }
  }

  function onLogout() {
    setAuthToken('');
  }

  function onInfoDialogClose() {
    setIsInfoDialogOpen(false);
    setError('');
    setSpinResult(undefined);
  }

  function onExtraClicked() {
    setIsExtraDialogOpen(true);
  }

  function onExtraDialogClose() {
    loadGameInfo();
    setIsExtraDialogOpen(false);
  }

  function onSpinEnd() {
    if (spinResult) {
      setIsInfoDialogOpen(true);
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
            'mt-[-124px] max-w-44',
            isSpinDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
          onClick={onSpin}
          src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-button_${buttonImageIndex}.png`}
          alt='spin-button'
        />
        <img
          className='max-w-[76px] bottom-[14px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/button-display.png'
          alt='button-display'
        />
        <div className='absolute bottom-[12px] flex gap-1 z-20 text-white'>
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
        className='-mt-16 max-w-56 cursor-pointer'
        onClick={onLogin}
        src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/login-btn.png'
        alt='login'
      />
    );
  }

  return (
    <div className='w-full h-dvh bg-center min-h-[639px] bg-cover bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/background.png")]'>
      <InfoDialog
        isOpen={isInfoDialogOpen}
        onDialogClose={onInfoDialogClose}
        error={error}
        spinResult={spinResult}
      />
      {authToken && (
        <ExtraDialog
          isOpen={isExtraDialogOpen}
          onDialogClose={onExtraDialogClose}
          authToken={authToken}
        />
      )}
      <div className='flex flex-col items-center overflow-hidden relative'>
        <img
          className='mt-2 max-w-28'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/logo.png'
          alt='logo'
        />
        <img
          className='-mt-8 min-w-[560px]'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/machine-body.png'
          alt='machine-body'
        />
        <div className='top-[382px] absolute'>
          <CountDown />
        </div>
        {messageOrButton}
        <img
          className='max-w-[272px] top-[118px] absolute'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/cover.png'
          alt='cover'
        />
        <div className='max-w-[200px] top-[154px] absolute'>
          <Spinner
            isSpinning={isSpinning}
            itemIndex={itemIndex}
            onSpinEnd={onSpinEnd}
          />
        </div>
        <img
          className='max-w-[52px] top-[118px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/arrow.png'
          alt='arrow'
        />
        <img
          className='max-w-12 top-[230px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/pin.png'
          alt='pin'
        />
      </div>
      {authToken && (
        <div className='flex flex-col absolute bottom-0 w-full'>
          <div className='h-20 flex items-center justify-evenly w-full bg-contain bg-no-repeat bg-center bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/btn-bg.png")]'>
            <div className='flex flex-col items-center cursor-pointer mt-2 px-10'>
              <img
                className='max-w-11'
                onClick={onExtraClicked}
                src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
                alt='spin-icon'
              />
              <div className='text-white text-xs font-semibold'>EXTRA SPIN</div>
            </div>
            <div className='flex flex-col items-center cursor-pointer mt-2 px-10'>
              <img
                className='max-w-12'
                onClick={onLogout}
                src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/logout.png'
                alt='logout'
              />
              <div className='text-white text-xs font-semibold'>LOGOUT</div>
            </div>
          </div>
          {stlGameInfo && (
            <div className='text-sm w-full rounded-b-md bg-[#0E1D3D] flex justify-around items-center gap-4 text-white px-2'>
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
