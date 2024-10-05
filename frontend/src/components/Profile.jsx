import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaPencilAlt, FaCheck } from 'react-icons/fa';
import { useSelector  } from 'react-redux';

const apiBaseUrl = import.meta.env.MODE === 'production' 
    ? 'https://se-ss-ion.onrender.com/api/v1' 
    : '/api/v1';

const Profile = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.isDarkMode);

  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${apiBaseUrl}/user/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch sessions');
          setLoading(false);
        }
      }
    };

    fetchSessions();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDuration = (totalTime) => {
    const { hours = 0, minutes = 0, seconds = 0 } = totalTime;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleEditClick = (sessionId, currentTitle) => {
    setEditingSessionId(sessionId);
    setNewTitle(currentTitle);
  };

  const handleSaveClick = async (sessionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${apiBaseUrl}/user/edit-session-title/${sessionId}`, { title: newTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId ? { ...session, title: response.data.session.title } : session
        )
      );

      setEditingSessionId(null);
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your sessions</h2>
      {sessions.length === 0 ? (
        <p>No sessions recorded yet. Your recorded se:<span className={isDarkMode ? "text-violet-400" : "text-violet-600"}>ss</span>:ions will appear here.</p>
      ) : (
        <div className={`${isDarkMode ? "bg-black" : "bg-white"}shadow overflow-hidden sm:rounded-lg`}>
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? "bg-cyan-200" : "bg-cyan-100"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? "bg-black" : "bg-white"} divide-y divide-gray-200`}>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(session.start_date_time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(session.total_time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingSessionId === session.id ? (
                        <input 
                          type="text" 
                          value={newTitle} 
                          onChange={(e) => setNewTitle(e.target.value)} 
                          className="border rounded p-1"
                        />
                      ) : (
                        session.title ? session.title : "Untitled session"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingSessionId === session.id ? (
                        <button onClick={() => handleSaveClick(session.id)}>
                          <FaCheck className="text-green-500" />
                        </button>
                      ) : (
                        <button onClick={() => handleEditClick(session.id, session.title)}>
                          <FaPencilAlt className="text-blue-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden">
            {sessions.map((session) => (
              <div key={session.id} className={`$${isDarkMode ? "bg-black" : "bg-white"} px-4 py-5 border-b border-gray-200 sm:px-6`}>
                <div className={`text-sm font-medium ${isDarkMode ? "text-gray-50" : "text-gray-900"} mb-2`}>
                  {session.title ? session.title : "Untitled session"}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(session.start_date_time)}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Duration: {formatDuration(session.total_time)}
                </div>
                <div className="mt-2">
                  {editingSessionId === session.id ? (
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)} 
                        className="border rounded p-1 flex-grow mr-2"
                        style={isDarkMode ? {color: "#222"}  : {}}
                      />
                      <button onClick={() => handleSaveClick(session.id)} className="p-2">
                        <FaCheck className="text-green-500" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEditClick(session.id, session.title)} className="p-2">
                      <FaPencilAlt className="text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;