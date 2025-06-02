import { useEffect, useState } from 'react';

interface TimerProps {
  time: number;
}

const Timer: React.FC<TimerProps> = ({ time }) => {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [remainingTime, setRemainingTime] = useState(time - currentTime);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setCurrentTime(now);
      setRemainingTime(time - now);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return <div>{remainingTime > 0 ? formatTime(remainingTime) : 'now!'}</div>;
};

export default Timer;
