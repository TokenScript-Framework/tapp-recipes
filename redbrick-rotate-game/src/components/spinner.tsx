'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  isSpinning: boolean;
  itemIndex: number;
  onSpinEnd: () => void;
}

export default function Spinner({
  isSpinning,
  itemIndex,
  onSpinEnd,
}: SpinnerProps) {
  const [spinState, setSpinState] = useState<
    'idle' | 'easing-in' | 'spinning' | 'easing-out'
  >('idle');

  useEffect(() => {
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
      setTimeout(() => {
        setSpinState('idle');
        onSpinEnd();
      }, itemIndex * 500);
    }
  }, [isSpinning, itemIndex, onSpinEnd, spinState]);

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
