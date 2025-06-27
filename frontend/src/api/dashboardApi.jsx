// frontend/src/api/dashboardApi.js
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

const DASHBOARD_BASE = '/api/dashboard';

// Get user's dashboard risk data (requires authentication)
export const getDashboardRiskData = async () => {
  try {
    const response = await API.get(`${DASHBOARD_BASE}/risk-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard risk data:', error.response?.data || error.message);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch dashboard data',
      status: error.response?.status
    };
  }
};

export default {
  getDashboardRiskData
};