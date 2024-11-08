'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  isSpinning?: boolean;
  itemIndex?: number;
}

export default function Spinner({
  isSpinning = false,
  itemIndex = 0,
}: SpinnerProps) {
  const [spinState, setSpinState] = useState<
    'idle' | 'easing-in' | 'spinning' | 'easing-out'
  >('idle');

  useEffect(() => {
    console.log(isSpinning, itemIndex, spinState);

    if (isSpinning && spinState === 'idle') {
      setSpinState('easing-in');
      setTimeout(() => {
        setSpinState('spinning');
      }, 1000);
    } else if (
      !isSpinning &&
      (spinState === 'spinning' || spinState === 'easing-in')
    ) {
      setSpinState('easing-out');
      setTimeout(() => setSpinState('idle'), itemIndex * 500);
    }
  }, [isSpinning, itemIndex, spinState]);

  return (
    <div>
      <img
        src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spinner.png'
        alt='Spinner'
        className={cn(
          spinState === 'easing-in' && 'animate-spin-start',
          spinState === 'spinning' && 'animate-spin-continuous',
          spinState === 'easing-out' && `animate-spin-${itemIndex}`
        )}
        style={{
          transform:
            spinState === 'idle' ? `rotate(${itemIndex * 72}deg)` : undefined,
        }}
      />
    </div>
  );
}
