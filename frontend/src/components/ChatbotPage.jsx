import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/userApi';
import { localFAQAnswer } from '../utils/faq';
import { useAuth } from '../contexts/AuthContext';

// Helper component to render text with bold tags from markdown
const BoldRenderer = ({ text }) => {
  if (!text || !text.includes('**')) {
    return text;
  }

  const parts = text.split('**');

  return (
    <>
      {parts.map((part, index) =>
        index % 2 !== 0 ? <strong key={index}>{part}</strong> : part
      )}
    </>
  );
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const { user } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Add welcome message with personalization info
  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([{
        sender: 'bot',
        text: `Hello! I'm your personalized cancer awareness assistant. I can provide tailored information based on your health profile. How can I help you today?`,
        isPersonalized: true
      }]);
    } else if (messages.length === 0) {
      setMessages([{
        sender: 'bot',
        text: `Hello! I'm your cancer awareness assistant. How can I help you today?`,
        isPersonalized: false
      }]);
    }
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Try FAQ first
    const faqAnswer = localFAQAnswer(input);
    if (faqAnswer) {
      setMessages((prev) => [...prev, { sender: 'bot', text: faqAnswer }]);
      setInput('');
      return;
    }

    // Otherwise, use API
    setLoading(true);
    try {
      console.log('Sending chat request with user:', user);
      const res = await API.post('/api/chat', { message: input });
      console.log('Chat response:', res.data);
      
      const cleanedReply = res.data.reply.replace(
        /^Here[''`"]?s a rewritten version with a more conversational and kind tone:\s*/i,
        ''
      );
      
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: cleanedReply,
        isPersonalized: res.data.personalized,
        recommendations: res.data.recommendations
      }]);
      
      setIsPersonalized(res.data.personalized);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to server.' }
      ]);
    }
    setLoading(false);
    setInput('');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 to-blue-100 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h2 className="text-3xl font-bold text-pink-800 px-6 py-6">Cancer Awareness Chatbot</h2>
          {isPersonalized && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Personalized
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-white border border-gray-300 hover:bg-pink-200 text-gray-700 text-xl rounded-full w-10 h-10 flex items-center justify-center shadow"
          aria-label="Close chatbot"
        >
          ✖
        </button>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto px-2 md:px-0">
        <div className="max-w-xl mx-auto bg-white bg-opacity-90 p-4 rounded-2xl shadow-lg h-[60vh] md:h-[65vh] overflow-y-auto flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}
            >
              {/* Bot avatar (left) */}
              {msg.sender === 'bot' && (
                <span className="mr-2 flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </span>
              )}
              <div className="flex flex-col">
                <span
                  className={`inline-block px-4 py-2 rounded-2xl shadow transition-all
                    ${msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-pink-500 bg-opacity-80 text-white rounded-bl-md whitespace-pre-line'
                    }
                    text-base max-w-xs md:max-w-md break-words`}
                >
                  <BoldRenderer text={msg.text} />
                </span>
                
                {/* Show recommendations if available */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm font-semibold text-blue-800 mb-2">💡 Personalized Recommendations:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {msg.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* User avatar (right) */}
              {msg.sender === 'user' && (
                <span className="ml-2 flex-shrink-0">
                  <span className="text-2xl">🧑</span>
                </span>
              )}
            </div>
          ))}
          
          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-start mb-2">
              <span className="flex items-center text-gray-400 text-base">
                <svg className="animate-spin mr-2 h-5 w-5 text-pink-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" strokeWidth="4" stroke="currentColor"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Generating personalized reply...
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area pinned at the bottom */}
      <form
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
        className="w-full max-w-xl mx-auto px-2 md:px-0 pt-2 pb-8 flex-shrink-0"
        autoComplete="off"
      >
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-lg shadow focus:outline-pink-400"
            placeholder="Type your question..."
            onKeyDown={e => { if (e.key === 'Enter' && !loading) sendMessage(); }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`transition bg-gradient-to-r from-pink-600 to-blue-600 text-white px-5 py-2 rounded-2xl shadow hover:from-pink-500 hover:to-blue-500 disabled:opacity-60 text-lg font-semibold`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotPage;
