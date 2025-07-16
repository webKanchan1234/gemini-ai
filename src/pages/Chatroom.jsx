import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const TOTAL_MESSAGES = 100;
const MESSAGES_PER_PAGE = 20;

const generateDummyMessages = () => {
  return Array.from({ length: TOTAL_MESSAGES }, (_, i) => ({
    id: i + 1,
    text: `Old message #${i + 1}`,
    sender: i % 2 === 0 ? 'ai' : 'user',
    timestamp: new Date(Date.now() - (TOTAL_MESSAGES - i) * 100000)
  }));
};

const DUMMY_MESSAGES = generateDummyMessages();

const MessageSkeleton = ({ isUser }) => (
  <div className={`p-3 max-w-xs rounded-lg ${isUser ? 'ml-auto' : ''}`}>
    <div className={`h-4 rounded mb-2 w-3/4 ${isUser ? 'ml-auto' : ''} ${isUser ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
    <div className={`h-3 rounded w-1/2 ${isUser ? 'ml-auto' : ''} ${isUser ? 'bg-blue-300' : 'bg-gray-300'}`}></div>
  </div>
);

const Chatroom = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [imgPreview, setImgPreview] = useState(null);
  const containerRef = useRef();
  const scrollRef = useRef();
  const { darkMode, toggleDarkMode } = useAuth();

  const loadMoreMessages = () => {
    const start = TOTAL_MESSAGES - page * MESSAGES_PER_PAGE;
    const end = start + MESSAGES_PER_PAGE;
    const newMsgs = DUMMY_MESSAGES.slice(Math.max(start, 0), end);
    setMessages(prev => [...newMsgs, ...prev]);
    if (page === 1) setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    loadMoreMessages();
  }, [page]);

  const handleScroll = () => {
    if (containerRef.current.scrollTop === 0 && page * MESSAGES_PER_PAGE < TOTAL_MESSAGES) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [page]);

  const sendMessage = () => {
    if (!input.trim() && !imgPreview) {
      toast.error('Message cannot be empty');
      return;
    }

    const userMsg = {
      id: Date.now(),
      text: input,
      image: imgPreview,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImgPreview(null);

    setTyping(true);
    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        text: 'Gemini says: ' + (userMsg.text || 'Nice image!'),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
      toast.info('Gemini responded');
    }, 1000 + Math.random() * 1000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
    toast.success('Image added');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`p-4 shadow-md flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Chatroom #{id}</h1>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <MessageSkeleton key={i} isUser={i % 2 === 0} />
            ))}
          </>
        ) : (
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`group relative p-1 max-w-xs md:max-w-md rounded-lg cursor-pointer break-words ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
                onClick={() => msg.text && copyToClipboard(msg.text)}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => e.key === 'Enter' && msg.text && copyToClipboard(msg.text)}
                aria-label={`Message from ${msg.sender}: ${msg.text || 'Image message'}`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="uploaded" 
                    className="mt-2 rounded-lg max-w-full max-h-48 object-contain" 
                  />
                )}
                <span className={`block text-xs mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                {msg.text && (
                  <span className={`absolute top-2 right-2 hidden group-hover:inline text-xs ${
                    msg.sender === 'user' ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Click to copy
                  </span>
                )}
              </div>
            ))}
            {typing && (
          <div className={`p-3 max-w-xs rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} text-sm italic`}>
            Gemini is typing...
          </div>
        )}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className={`cursor-pointer flex items-center justify-center p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition`}>
            <span className="mr-2">📷</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload image"
            />
            Upload
          </label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className={`flex-1 p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !imgPreview) || typing}
            className={`py-3 px-6 rounded-lg font-medium ${(!input.trim() && !imgPreview) || typing ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;