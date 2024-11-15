/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Loader from '../components/loader/loader';
import { cn } from '@/lib/utils';

// @ts-ignore
export const Buy: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className='w-full'>
      <Loader show={loading} />
    </div>
  );
};
