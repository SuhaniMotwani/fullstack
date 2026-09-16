// frontend/src/core/api/apiClient.js
import axios from 'axios';

// Default to backend PORT 3000 in local dev if VITE_API_URL is not provided
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token from localStorage if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired or invalid credentials
      localStorage.removeItem('token');
      // Dispatch custom event so AuthContext or Router can redirect seamlessly
      window.dispatchEvent(new CustomEvent('auth:session_expired'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
