import axios from 'axios';

// Create axios instance with base URL - REMOVED /api from here
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
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      const response = await API.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/api/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await API.get('/api/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user data' };
    }
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete API.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Export the configured axios instance for other API calls

export default API;