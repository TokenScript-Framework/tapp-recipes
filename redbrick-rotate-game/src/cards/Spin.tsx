/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { spin } from '@/lib/backendApi';
import { buySpin, joinGame, spinSignature } from '@/lib/spinService';
import Spinner from '@/components/Spinner';

// @ts-ignore
export const Spin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [itemIndex, setItemIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    tokenscript.action.setActionButton({ show: false });
    setLoading(false);
  }, []);

  async function onSpin() {
    const joinResponse = await joinGame();
    const authToken = joinResponse.data.authInfo.accessToken;

    const spinSignatureResponse = await spinSignature(authToken);

    const hash = await buySpin(spinSignatureResponse);

    const result = await spin(
      hash,
      spinSignatureResponse.data.nonce,
      authToken
    );

    console.log(result);
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
        <img
          className='-mt-36 max-w-56'
          onClick={onSpin}
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-button_0.png'
          alt='spin-button'
        />
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
        <img
          className='max-w-24 bottom-4 absolute z-10'
          src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/button-display.png'
          alt='button-display'
        />
      </div>
      <Loader show={loading} />
    </div>
  );
};
