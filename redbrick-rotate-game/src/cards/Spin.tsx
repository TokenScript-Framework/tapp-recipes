/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  getNonce,
  getSignMessage,
  getSpinSignature,
  join,
  spin,
} from '@/lib/redbrickApi';
import { encryptJoinData, encryptSpinData } from '@/lib/backendApi';
import { publicClient, walletClient } from '@/lib/provider';
import { opBNBTestnet } from 'viem/chains';

// @ts-ignore
export const Spin: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenscript.action.setActionButton({ show: false });
    setLoading(false);
  }, []);

  async function onSpin() {
    const nonce = await getNonce();
    const message = getSignMessage(nonce);
    const sig = await tokenscript.personal.sign({ data: message });
    const joinData = await encryptJoinData(message, sig as string);
    const joinResponse = await join(joinData);
    const authToken = joinResponse.data.authInfo.accessToken;
    const spinData = await encryptSpinData();
    const spinSignatureResponse = await getSpinSignature(spinData, authToken);

    await walletClient.switchChain({ id: opBNBTestnet.id });

    const hash = await walletClient.sendTransaction({
      to: spinSignatureResponse.data.contractAddress,
      data: spinSignatureResponse.data.data,
      value: BigInt(spinSignatureResponse.data.price),
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const result = await spin(
      hash,
      spinSignatureResponse.data.nonce,
      authToken
    );
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
