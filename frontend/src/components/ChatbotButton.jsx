import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatbotButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chatbot'); // make sure this route exists
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      aria-label="Open Chatbot"
    >
      💬
    </button>
  );
};

export default ChatbotButton;