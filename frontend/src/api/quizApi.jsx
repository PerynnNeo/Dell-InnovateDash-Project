import axios from 'axios';

// Create axios instance with default config (following your project pattern)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Add /api/quiz to the requests since baseURL is just the main server URL
const QUIZ_BASE = '/api/quiz';

// Get active quiz for public access
export const getActiveQuiz = async () => {
  try {
    const response = await API.get(`${QUIZ_BASE}/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active quiz:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quiz',
      status: error.response?.status
    };
  }
};

// Submit quiz attempt (works for both anonymous and logged-in users)
export const submitQuizAttempt = async (quizData) => {
  try {
    const response = await API.post(`${QUIZ_BASE}/submit`, quizData);
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to submit quiz',
      status: error.response?.status
    };
  }
};

// Get quiz analytics (admin only)
export const getQuizAnalytics = async (quizId, dateRange = {}) => {
  try {
    const params = {};
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    
    const response = await API.get(`${QUIZ_BASE}/${quizId}/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz analytics:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch analytics',
      status: error.response?.status
    };
  }
};

// Create new quiz (admin only)
export const createQuiz = async (quizData) => {
  try {
    const response = await API.post(`${QUIZ_BASE}/create`, quizData);
    return response.data;
  } catch (error) {
    console.error('Error creating quiz:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create quiz',
      status: error.response?.status
    };
  }
};

// Helper function to track quiz completion for conversion analytics
export const trackQuizCompletion = async (attemptId) => {
  try {
    const response = await API.patch(`${QUIZ_BASE}/attempt/${attemptId}/signup`);
    return response.data;
  } catch (error) {
    console.error('Error tracking quiz completion:', error.response?.data || error.message);
    // Don't throw error as this is for analytics only
    return { success: false };
  }
};

export default {
  getActiveQuiz,
  submitQuizAttempt,
  getQuizAnalytics,
  createQuiz,
  trackQuizCompletion
};