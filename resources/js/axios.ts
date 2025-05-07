// resources/js/axios.ts
import axios from 'axios'

// Set base URL for Axios requests based on environment
axios.defaults.baseURL = import.meta.env.MODE === 'development'
  ? 'http://127.0.0.1:8000/api'
  : 'https://stephandouglasduval.com/api'

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
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Enable credentials (cookies) for cross-origin requests
axios.defaults.withCredentials = true

export default axios
