import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { FaSun, FaMoon } from 'react-icons/fa';
import Login from './components/Login';
import Stopwatch from './components/Stopwatch';
import Profile from './components/Profile';
import SignUp from './components/SignUp';
import { styles } from "./components/themeStyles";

const DarkModeToggle = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className={`
        flex items-center justify-center
        px-4 py-2 rounded-full
        transition-all duration-300 ease-in-out
        ${isDarkMode 
          ? 'bg-gray-800 text-cyan-200 hover:bg-gray-700' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}
      `}
    >
      {isDarkMode ? (
        <>
          <FaSun className="mr-2" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <FaMoon className="mr-2" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.isDarkMode);

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const setCurrentUser = (user) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken) {
        setIsAuthenticated(true);
        setCurrentUser(decodedToken);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setIsAuthenticated(true);
    setCurrentUser(decodedToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const mode = isDarkMode ? 'DARK' : 'LIGHT';

  return (
    <Router>
      <div className={styles[mode].container}>
        <nav className={styles[mode].nav}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">   
                  <Link to="/" className={styles[mode].link}>
                    <span className="text-xl font-bold">se:<span className={isDarkMode ? "text-violet-400" : "text-violet-600"}>ss</span>:ion</span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                {isAuthenticated && (
                  <>
                    <Link to="/profile" className={styles[mode].link}>Profile</Link>
                    <button onClick={logout} className={styles[mode].button}>Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated ? <Stopwatch /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/signup" element={isAuthenticated ? <SignUp onSignUp={login} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>

);
};

export default App;