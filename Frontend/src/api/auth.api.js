import api from './api';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || '';
const getAuthBaseUrl = () => {
  if (AUTH_BASE_URL) return AUTH_BASE_URL.replace(/\/$/, '');
  return typeof window !== 'undefined' ? window.location.origin : '';
};

export const authApi = {
  /**
   * Returns the Google OAuth authorization URL
   */
  getGoogleAuthUrl: () => {
    return `${getAuthBaseUrl()}/api/auth/google`;
  },

  /**
   * Triggers redirection to Google OAuth endpoint
   */
  loginWithGoogle: () => {
    window.location.href = authApi.getGoogleAuthUrl();
  },

  /**
   * Fetch current authenticated user session
   */
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Logout current authenticated user session
   */
  logout: async () => {
    const response = await api.get('/api/auth/logout');
    return response.data;
  },
};

export default authApi;
