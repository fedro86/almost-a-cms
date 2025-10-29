import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to home if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Development mode bypass: allow access without auth if VITE_SKIP_AUTH is set
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

  // Show loading state while checking authentication
  if (isLoading && !skipAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (unless skip auth is enabled)
  if (!isAuthenticated && !skipAuth) {
    return <Navigate to="/auth/device-flow" replace />;
  }

  // Render children if authenticated or skip auth is enabled
  return <>{children}</>;
}

export default ProtectedRoute;
