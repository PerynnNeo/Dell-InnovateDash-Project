// frontend/src/api/lifestyleQuizApi.js
import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const LIFESTYLE_QUIZ_BASE = '/api/lifestyle-quiz';

// Get active lifestyle quiz (requires authentication)
export const getActiveLifestyleQuiz = async () => {
  try {
    const response = await API.get(`${LIFESTYLE_QUIZ_BASE}/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lifestyle quiz:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch lifestyle quiz',
      status: error.response?.status
    };
  }
};

// Submit lifestyle quiz attempt (requires authentication)
export const submitLifestyleQuizAttempt = async (quizData) => {
  try {
    const response = await API.post(`${LIFESTYLE_QUIZ_BASE}/submit`, quizData);
    return response.data;
  } catch (error) {
    console.error('Error submitting lifestyle quiz:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to submit lifestyle quiz',
      status: error.response?.status
    };
  }
};

// Get user's lifestyle quiz attempts history
export const getUserLifestyleQuizAttempts = async () => {
  try {
    const response = await API.get(`${LIFESTYLE_QUIZ_BASE}/attempts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lifestyle quiz attempts:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quiz attempts',
      status: error.response?.status
    };
  }
};

export default {
  getActiveLifestyleQuiz,
  submitLifestyleQuizAttempt,
  getUserLifestyleQuizAttempts
};