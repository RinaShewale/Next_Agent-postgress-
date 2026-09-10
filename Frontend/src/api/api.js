
import axios from 'axios';

// Base API URL for Auth/Sandbox router.
// Use same-origin proxy by default, or override with VITE_AUTH_API_URL.
const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending and receiving HTTP cookies (e.g. passport sessions)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export default api;
