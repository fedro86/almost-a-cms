import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/auth';
import GitHubApiService from '../services/github-api';
import TokenStorage from '../utils/tokenStorage';

/**
 * User information interface
 */
export interface User {
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Check authentication status and load user info
   */
  const initializeAuth = async () => {
    setIsLoading(true);

    try {
      // Check if token exists
      const hasToken = AuthService.isAuthenticated();

      if (!hasToken) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to load cached user info first
      const cachedUser = TokenStorage.getUserInfo();
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
      }

      // Fetch fresh user info from GitHub
      const result = await GitHubApiService.getAuthenticatedUser();

      if (result.success && result.data) {
        setUser(result.data as User);
        setIsAuthenticated(true);
        setError(null);
      } else {
        // Token is invalid or expired
        console.error('Failed to fetch user:', result.error);
        handleAuthFailure();
      }
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      handleAuthFailure();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle authentication failure
   */
  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    AuthService.logout();
  };

  /**
   * Initiate login flow
   */
  const login = () => {
    try {
      AuthService.login();
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    AuthService.logout();
    GitHubApiService.clearInstance();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  /**
   * Refresh user information
   */
  const refreshUser = async () => {
    if (!isAuthenticated) return;

    try {
      const result = await GitHubApiService.getAuthenticatedUser();

      if (result.success && result.data) {
        setUser(result.data as User);
        setError(null);
      } else {
        setError(result.error || 'Failed to refresh user data');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Refresh user error:', err);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 * Access authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
