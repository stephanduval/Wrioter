import { ofetch } from 'ofetch';
import { useRouter } from 'vue-router';

// Create a router instance for navigation
const router = useRouter();

// Determine the base URL based on the current environment
const getBaseUrl = () => {
  // In production, always use the production URL
  if (window.location.hostname === 'stephandouglasduval.com') {
    return 'https://stephandouglasduval.com/api';
  }
  
  // In development, use the environment variable or fallback
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
};

// Create a base API client with interceptors
export const $api = ofetch.create({
  baseURL: getBaseUrl(),
  credentials: 'include', // Ensures token is sent
  async onRequest({ options, request }) {
    try {
      // Log the full request URL
      console.log('API Request URL:', request);
      
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.warn('No access token found in localStorage');
        // Don't throw here, just log - some endpoints might be public
      } else {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        // Log that we're using a token
        console.log('Using token for request to:', request);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  },
  async onResponse({ response }) {
    // Log successful responses
    console.log('API Response:', {
      status: response.status,
      ok: response.ok
    });
  },
  async onResponseError({ response }) {
    // Log error responses
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText
    });
    
    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      console.warn('Authentication token expired or invalid');
      // Clear auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('abilityRules');
      
      // Redirect to login
      window.location.href = '/login';
    }
  },
});

// Export a function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

// Export a function to get the auth token
export const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Export a function to set auth data
export const setAuthData = (data: { accessToken: string; userData: any; abilityRules: any[] }) => {
  try {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userData', JSON.stringify(data.userData));
    localStorage.setItem('abilityRules', JSON.stringify(data.abilityRules));
    console.log('Auth data stored successfully');
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw new Error('Failed to store authentication data');
  }
};

// Export a function to clear auth data
export const clearAuthData = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('abilityRules');
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
