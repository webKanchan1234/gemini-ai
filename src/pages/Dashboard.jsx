import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

const Dashboard = () => {
  const [chatrooms, setChatrooms] = useState([]);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();
  const { user, logout, darkMode, toggleDarkMode } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('chatrooms');
    if (saved) {
      setChatrooms(JSON.parse(saved));
      setTimeout(() => setLoading(false), 500);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatrooms', JSON.stringify(chatrooms));
  }, [chatrooms]);

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    const newRoom = { id: Date.now(), title: newTitle };
    setChatrooms(prev => [...prev, newRoom]);
    setNewTitle('');
    toast.success('Chatroom created');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this chatroom?')) {
      setChatrooms(prev => prev.filter(room => room.id !== id));
      toast.success('Chatroom deleted');
    }
  };

  const filtered = chatrooms.filter(room =>
    room.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-4 md:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Chatrooms</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search chatrooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            aria-label="Search chatrooms"
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="New chatroom title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className={`flex-1 p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            aria-label="New chatroom title"
          />
          <button
            onClick={handleCreate}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-14 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(room => (
              <li
                key={room.id}
                className={`flex justify-between items-center p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}
              >
                <Link
                  to={`/chat/${room.id}`}
                  className="text-blue-500 hover:text-blue-600 hover:underline flex-1"
                >
                  {room.title}
                </Link>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="text-red-500 hover:text-red-600 ml-4"
                  aria-label={`Delete ${room.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <p className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {chatrooms.length === 0 ? 'No chatrooms yet. Create one!' : 'No matching chatrooms found.'}
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;