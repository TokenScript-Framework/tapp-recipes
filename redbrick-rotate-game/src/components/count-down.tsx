'use client';

import { useState, useEffect } from 'react';

export default function CountDown() {
  const [timeLeft, setTimeLeft] = useState('--:--:--');
  const [targetTime, setTargetTime] = useState<number>(getNext4AMUTC());

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const hours = String(
          Math.floor((difference / (1000 * 60 * 60)) % 24)
        ).padStart(2, '0');
        const minutes = String(
          Math.floor((difference / (1000 * 60)) % 60)
        ).padStart(2, '0');
        const seconds = String(Math.floor((difference / 1000) % 60)).padStart(
          2,
          '0'
        );

        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      } else {
        setTimeLeft('00:00:00');
        setTargetTime(getNext4AMUTC());
      }
    };

    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [targetTime]);

  return (
    <div className='flex gap-2 items-center'>
      <div className="text-gray-200 text-sm">Game reset:</div>
      <div className="text-white text-base font-semibold">{timeLeft}</div>
    </div>
  );
}

function getNext4AMUTC() {
  const now = new Date();
  const next4AMUTC = new Date();

  next4AMUTC.setUTCHours(4, 0, 0, 0);

  if (now >= next4AMUTC) {
    next4AMUTC.setUTCDate(now.getUTCDate() + 1);
  }

  return next4AMUTC.getTime();
}
