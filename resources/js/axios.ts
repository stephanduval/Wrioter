// resources/js/axios.ts
import axios from 'axios';

// Determine the base URL based on the current environment
const getBaseUrl = () => {
  // In production, always use the production URL
  if (window.location.hostname === 'stephandouglasduval.com') {
    return 'https://stephandouglasduval.com/api';
  }
  
  // In development, use the environment variable or fallback
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
};

// Set base URL for Axios requests
axios.defaults.baseURL = getBaseUrl();

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('abilityRules')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Enable credentials (cookies) for cross-origin requests
axios.defaults.withCredentials = true

export default axios
