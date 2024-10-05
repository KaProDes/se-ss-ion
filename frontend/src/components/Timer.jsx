import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const Timer = () => {
  const [time, setTime] = useState(0);
  const isDarkMode = useSelector((state) => state.isDarkMode);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 10); // Increment by 1000ms (1 second)
    }, 10);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <div className="text-6xl font-bold mb-8">{formatTime()}</div>
    </div>
  );
};

export default Timer;