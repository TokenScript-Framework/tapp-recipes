/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { spin } from '@/lib/backendApi';
import { buySpin, joinGame, spinSignature } from '@/lib/spinService';
import Spinner from '@/components/Spinner';
import { getGameStatus, getRemainingPool } from '@/lib/redbrickApi';

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
  const [buttonImageIndex, setButtonImageIndex] = useState(0); // button up high
  const [authToken, setAuthToken] = useState('');
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    tokenscript.action.setActionButton({ show: false });
    setLoading(false);
    async function run() {
      const eventStatus = await getGameStatus();
      if (eventStatus.data.isComing) {
        setMessage(`Coming Soon (${eventStatus.data.open})`);
      } else if (eventStatus.data.isEnd) {
        setMessage(`Event Ended (${eventStatus.data.close})`);
      }
    }

    run();
  }, []);

  async function onLogin() {
    const joinResponse = await joinGame();
    setAuthToken(joinResponse.data.authInfo.accessToken);
  }

  useEffect(() => {
    if (!authToken) return;
    async function run() {
      const remainingPool = await getRemainingPool(authToken);
      if (remainingPool <= 0) {
        setMessage(
          'The total global spin pool is reached. Please spin tomorrow!'
        );
      }
    }
    run();
  }, [authToken]);

  async function onSpin() {
    setButtonImageIndex(4); // button pressed down
    setTimeout(() => setButtonImageIndex(0), 300);

    if (!authToken) return;

    setIsSpinning(true);
    const spinSignatureResponse = await spinSignature(authToken);
    const hash = await buySpin(spinSignatureResponse);
    const result = await spin(
      hash,
      spinSignatureResponse.data.nonce,
      authToken
    );

    setItemIndex(itemIndexByType[result.rbRewardType]);
    setIsSpinning(false);
  }

  let messageOrButton;
  if (message) {
    messageOrButton = (
      <div className='absolute max-w-80 text-center text-xl backdrop-blur-xl text-white font-bold bottom-16 border p-4 rounded-xl'>
        {message}
      </div>
    );
  } else if (authToken) {
    messageOrButton = (
      <>
        <img
          className='-mt-36 max-w-56 cursor-pointer'
          onClick={onSpin}
          src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-button_${buttonImageIndex}.png`}
          alt='spin-button'
        />
        <img
          className='max-w-24 bottom-4 absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/button-display.png'
          alt='button-display'
        />
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
    <div className='w-full h-[100dvh] bg-center bg-cover bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/background.png")]'>
      <div className='flex flex-col items-center overflow-hidden relative'>
        <img
          className='mt-4 max-w-40'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/logo.png'
          alt='logo'
        />
        <img
          className='-mt-8 w-[130%] max-w-none'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/machine-body.png'
          alt='machine-body'
        />
        {messageOrButton}
        <img
          className='max-w-[19rem] top-44 absolute'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/cover.png'
          alt='cover'
        />
        <div className='max-w-52 top-56 absolute'>
          <Spinner isSpinning={isSpinning} itemIndex={itemIndex} />
        </div>
        <img
          className='max-w-16 top-[170px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/arrow.png'
          alt='arrow'
        />
        <img
          className='max-w-16 top-[296px] absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/pin.png'
          alt='pin'
        />
      </div>
      <Loader show={loading} />
      <img
        className='hidden'
        src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-button_4.png`}
        alt='spin-button-eager-load'
      />
    </div>
  );
};
