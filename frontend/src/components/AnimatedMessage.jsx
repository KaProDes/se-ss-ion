import React from 'react';
import { useSelector } from 'react-redux';

const items = ["session", "hour", "shot", "minute", "second", "chance", "day", "week", "month", "year", "opportunity", "moment"];

const getRandomItem = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const AnimatedMessage = ({ user }) => {
  const randomItem = React.useMemo(() => getRandomItem(items), []);

  const isDarkMode = useSelector((state) => state.isDarkMode);

  const styles = {
    container: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    text: isDarkMode ? 'text-white' : 'text-black',
    highlight: isDarkMode ? 'text-cyan-500' : 'text-orange-700 font-bold',
    username: 'text-violet-600'
  };

  return (
    <div className={`${styles.container} p-4`}>
      <span className={styles.text}>
        Make every <span className={styles.highlight}>{randomItem}</span> count, 
        <span className={styles.username}> {user?.username ?? "User"}</span>.
      </span>
    </div>
  );
};

export default AnimatedMessage;