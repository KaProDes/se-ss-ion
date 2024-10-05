import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import {styles} from './themeStyles.js';
import AnimatedMessage from './AnimatedMessage.jsx';

const apiBaseUrl = import.meta.env.MODE === 'production' 
    ? 'https://se-ss-ion.onrender.com/api/v1' 
    : '/api/v1';


const Stopwatch = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const isDarkMode = useSelector((state) => state.isDarkMode);
  const user = useSelector((state) => state.user);

  const mode = isDarkMode ? 'DARK' : 'LIGHT';

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);


  const startStop = () => {
    if (!isRunning) {
      setStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const reset = async () => {
    setIsRunning(false);
    if (time > 0) {
        try {
            const timeInSeconds = time / 1000; // since set interval was operates in milliseconds
            const token = localStorage.getItem('token');
            await axios.post(`${apiBaseUrl}/user/save-session`, {
                startDateTime: startTime.toISOString(),
                totalTime: timeInSeconds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Session saved successfully!'); // Toast message for success
        } catch (error) {
            console.error('Error saving session:', error);
            toast.error('Failed to save session'); // Toast message for error
        }
    }
    setTime(0);
    setStartTime(null);
};


  const formatTime = () => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <AnimatedMessage user={user} />
      <div className="text-6xl font-bold mb-8">{formatTime()}</div>
      <div className="space-x-4">
        <button
          onClick={startStop}
          className={`px-6 py-2 rounded-md text-white font-semibold ${
            isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-md text-white font-semibold bg-blue-500 hover:bg-blue-600"
        >
          Reset
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Stopwatch;