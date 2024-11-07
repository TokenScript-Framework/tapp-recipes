/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { spin } from '@/lib/backendApi';
import { buySpin, joinGame, spinSignature } from '@/lib/spinService';

// @ts-ignore
export const Spin: React.FC = () => {
  const [loading, setLoading] = useState(true);

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
    <div className='w-full'>
      <Button onClick={onSpin} className={cn('w-full', 'mt-4')}>
        Spin
      </Button>
      <Loader show={loading} />
    </div>
  );
};
