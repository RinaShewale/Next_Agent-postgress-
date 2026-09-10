import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, logoutUser } from '../store/authSlice';
import authApi from '../api/auth.api';

/**
 * Custom hook for managing authentication state and Google OAuth interactions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // Automatically check session status on initial mount if loading
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  /**
   * Redirect to Google OAuth URL for registration/login
   */
  const loginWithGoogle = () => {
    authApi.loginWithGoogle();
  };

  /**
   * Perform logout action
   */
  const logout = () => {
    return dispatch(logoutUser()).unwrap();
  };

  /**
   * Refresh current user session status manually
   */
  const checkAuthStatus = () => {
    return dispatch(fetchCurrentUser()).unwrap();
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    loginWithGoogle,
    logout,
    checkAuthStatus,
  };
}

export default useAuth;
