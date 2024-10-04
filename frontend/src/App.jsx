import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Stopwatch from './components/Stopwatch';
import Profile from './components/Profile';
import SignUp from './components/SignUp';
import { jwtDecode } from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';
import { styles} from "./components/themeStyles";


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
      console.log(decodedToken)
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
    setUser(decodedToken);
    setCurrentUser(decodedToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
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
                <Link to="/" className={styles[mode].link}><span className="text-xl font-bold">se:<span className={isDarkMode ? "text-violet-400" : "text-violet-600"}>ss</span>:ion</span></Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={toggleDarkMode} className={styles[mode].button}>
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                {isAuthenticated && (
                  <>
                    {/* <Link to="/" className={styles[mode].link}>Stopwatch</Link> */}
                    <Link to="/profile" className={styles[mode].link}>Profile</Link>
                    <button onClick={logout} className={styles[mode].button}>Logout</button>
                    {/* <span className={styles[mode].msg}>Welcome, {user.username}!</span> */}
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