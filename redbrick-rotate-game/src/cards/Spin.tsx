/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// @ts-ignore
export const Spin: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenscript.action.setActionButton({ show: false });
    setLoading(false);
  }, []);

  async function spin() {
    console.log('TODO: Implement spin');
  }

  return (
    <div className='w-full'>
      <Button onClick={spin} className={cn('w-full', 'mt-4')}>
        Spin
      </Button>
      <Loader show={loading} />
    </div>
  );
};
