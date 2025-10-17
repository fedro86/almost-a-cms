import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

/**
 * OAuth Callback Handler Component
 * Handles the redirect from GitHub after OAuth authorization
 */
export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get code and state from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setMessage(`Authentication cancelled: ${error}`);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid callback parameters. Please try logging in again.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      // Exchange code for token
      setMessage('Exchanging authorization code...');
      const result = await AuthService.handleCallback(code, state);

      if (!result.success) {
        setStatus('error');
        setMessage(result.error || 'Authentication failed. Please try again.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      // Fetch user information
      setMessage('Loading your profile...');
      await refreshUser();

      // Success!
      setStatus('success');
      setMessage('Authentication successful! Redirecting...');

      // Redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (err: any) {
      console.error('Callback error:', err);
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred.');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {status === 'processing' && (
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}

          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'processing' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h2>

          <p className="text-gray-600">{message}</p>

          {status === 'error' && (
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
