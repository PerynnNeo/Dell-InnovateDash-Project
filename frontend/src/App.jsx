
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';



// Auth pages
import Login from './components/Login';
import Register from './components/Register';

// Dashboard + other features
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import FAQ from './components/FAQ';
import Index from './components/Index';
import KnowledgeQuiz from './components/KnowledgeQuiz'; 
import LifestyleQuiz from './components/LifeStyleQuiz';

import './index.css';

//Chat
import ChatbotPage from './components/ChatbotPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/knowledge_quiz" element={<KnowledgeQuiz />} /> 
          <Route path="/faq" element={<FAQ />} />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />


          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/lifestyle_quiz" 
            element={
              <ProtectedRoute>
                <LifestyleQuiz />
              </ProtectedRoute>
            } 
          />

           <Route 
            path="/chatbot" 
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            } 
          />
          
          {/* <Route path="/chatbot" element={<ChatbotPage />} /> */}

          
          {/* Catch-all: if unknown route, redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;