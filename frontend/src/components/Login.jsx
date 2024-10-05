import { useState } from 'react';
import axios from 'axios';
import SignUp from './SignUp';
import { useSelector,  } from 'react-redux';
import Timer from "./Timer";

const apiBaseUrl = import.meta.env.MODE === 'production' 
    ? 'https://se-ss-ion.onrender.com/api/v1' 
    : '/api/v1';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const isDarkMode = useSelector((state) => state.isDarkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiBaseUrl}/user/login`, { username, password });
      onLogin(response.data.token);
    } catch (err) {
      console.log(err);
      setError('Invalid username or password');
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-grey-600" : "bg-gray-50"} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md space-y-8">
      <h2 className={`mt-6 text-center text-6xl font-extrabold ${isDarkMode ? "text-gray-50" : "text-gray-900"}`}>se:<span className={isDarkMode ? "text-violet-400" : "text-violet-600"}>ss</span>:ion</h2>
        <div>
          <Timer />
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? "text-gray-50" : "text-gray-900"}`}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        {isLogin ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        ) : (
          <SignUp onSignUp={onLogin} />
        )}
        <div className="text-center">
          <button
            onClick={toggleForm}
            className="text-violet-600 hover:text-violet-500"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
