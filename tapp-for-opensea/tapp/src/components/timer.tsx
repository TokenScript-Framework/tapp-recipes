import { useEffect, useState } from 'react';

interface CountdownProps {
    endTime: number;
}

export function CountdownTimer({ endTime }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const diff = endTime - now;
            
            if (diff <= 0) {
                setTimeLeft('Expired');
                clearInterval(timer);
                return;
            }

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <span className="text-red-500 font-mono">{timeLeft}</span>
    );
}