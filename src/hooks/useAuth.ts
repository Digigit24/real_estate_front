// src/hooks/useAuth.ts
import { authService } from '@/services/authService';
import { LoginPayload, User } from '@/types/authTypes';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use SWR for global user state
  const { data: user, mutate: setUser } = useSWR<User | null>(
    'auth-user',
    () => authService.getCurrentUser(),
    {
      fallbackData: authService.getCurrentUser(),
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  // Check authentication status
  const isAuthenticated = !!user && authService.isAuthenticated();

  // Login function
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await authService.login(payload);
      
      // Update local state (shared via SWR)
      await setUser(loggedInUser, { revalidate: false });
      
      // Clear other cached data but keep auth user
      mutate((key) => key !== 'auth-user', undefined, { revalidate: false });
      
      // Navigate to dashboard
      navigate('/', { replace: true });
      
      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all other SWR cache first
      mutate((key) => key !== 'auth-user', undefined, { revalidate: false });
      
      // Update local state (shared via SWR) to null
      await setUser(null, { revalidate: false });
      
      // Navigate to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, [setUser]);

  // Check if user has access to a specific module
  const hasModuleAccess = useCallback((module: string) => {
    return authService.hasModuleAccess(module);
  }, [user]);

  // Get tenant information
  const getTenant = useCallback(() => {
    return authService.getTenant();
  }, [user]);

  // Get user roles
  const getUserRoles = useCallback(() => {
    return authService.getUserRoles();
  }, [user]);

  // Verify token validity
  const verifyToken = useCallback(async () => {
    try {
      const isValid = await authService.verifyToken();
      if (!isValid) {
        // Token is invalid, logout user
        await logout();
        return false;
      }
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      await logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    hasModuleAccess,
    getTenant,
    getUserRoles,
    verifyToken,
  };
};