import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const items = ["session", "hour", "shot", "minute", "second", "chance", "day", "week", "month", "year", "opportunity", "moment"];

const shuffle = (array) => {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

const AnimatedMessage = ({ user }) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    const totalItems = items.length;
    shuffle(items);
    const interval = setInterval(() => {
      if (currentItemIndex < totalItems - 1) {
        setCurrentItemIndex((prevIndex) => prevIndex + 1);
      } else {
        clearInterval(interval); 
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval); 
  });

  const styles = {
    DARK: {
      msg: 'text-white',
      container: 'bg-gray-900',
    },
    LIGHT: {
      msg: 'text-black',
      container: 'bg-gray-100',
    },
  };

  const isDarkMode = useSelector((state) => state.isDarkMode);
  const mode = isDarkMode ? 'DARK' : 'LIGHT';

  return (
    <div className={`${styles[mode].container} p-4`}>
      <span className={`transition-opacity duration-500 ${styles[mode].msg}`}>
        Make every <span className={isDarkMode ? "text-cyan-500" : "text-orange-700 font-bold"}>{items[currentItemIndex]}</span> count, <span className='text-violet-600'>{user?.username ?? "User"}</span>.
      </span>
    </div>
  );
};


export default AnimatedMessage;


