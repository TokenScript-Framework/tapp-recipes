/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { PublicClient } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function MainSection() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const client = usePublicClient() as PublicClient;

  return (
    <div className='container mx-auto p-4'>
    </div>
  );
}
