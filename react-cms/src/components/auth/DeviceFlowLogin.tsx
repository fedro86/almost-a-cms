import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeviceFlowAuthService, DeviceFlowStatus } from '../../services/device-flow-auth';
import { GITHUB_CONFIG } from '../../config/github';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Device Flow Login Component
 *
 * Handles GitHub Device Flow authentication:
 * 1. Displays user code for authorization
 * 2. Opens GitHub verification page in new tab
 * 3. Polls GitHub API for authorization
 * 4. Redirects to dashboard on success
 */
export function DeviceFlowLogin() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<'idle' | 'initiating' | 'waiting' | 'success' | 'error'>('idle');
  const [flowState, setFlowState] = useState<DeviceFlowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Start device flow on component mount
  useEffect(() => {
    // Don't start flow if already authenticated
    if (DeviceFlowAuthService.isAuthenticated()) {
      navigate('/dashboard');
      return;
    }

    initiateFlow();

    // Cleanup polling on unmount
    return () => {
      DeviceFlowAuthService.stopPolling();
    };
  }, [navigate]);

  // Update time remaining counter
  useEffect(() => {
    if (flowState?.expiresIn) {
      setTimeRemaining(flowState.expiresIn);

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setError('Authentication timed out. Please try again.');
            setStatus('error');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [flowState?.expiresIn]);

  const initiateFlow = async () => {
    setStatus('initiating');
    setError(null);

    const result = await DeviceFlowAuthService.initiateDeviceFlow(GITHUB_CONFIG.clientId);

    if (result.status === 'error') {
      setError(result.error || 'Failed to start authentication');
      setStatus('error');
      return;
    }

    setFlowState(result);
    setStatus('waiting');

    // Automatically open GitHub verification page
    if (result.verificationUri) {
      window.open(result.verificationUri, '_blank');
    }

    // Start polling for access token
    DeviceFlowAuthService.startPolling(
      GITHUB_CONFIG.clientId,
      handleSuccess,
      handleError
    );
  };

  const handleSuccess = async (token: string) => {
    setStatus('success');

    // Fetch user information
    await refreshUser();

    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setStatus('error');
    DeviceFlowAuthService.stopPolling();
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setFlowState(null);
    initiateFlow();
  };

  const handleCancel = () => {
    DeviceFlowAuthService.stopPolling();
    navigate('/');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    if (flowState?.userCode) {
      try {
        await navigator.clipboard.writeText(flowState.userCode);
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GitHub Authentication
          </h1>
          <p className="text-gray-600">
            Connect your GitHub account to continue
          </p>
        </div>

        {/* Initiating State */}
        {status === 'initiating' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Starting authentication...</p>
          </div>
        )}

        {/* Waiting for Authorization */}
        {status === 'waiting' && flowState && (
          <div className="space-y-6">
            {/* User Code Display */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-center">
              <p className="text-white text-sm mb-2">Enter this code on GitHub:</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                <p className="text-4xl font-bold text-white tracking-wider font-mono">
                  {flowState.userCode}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="text-white text-sm underline hover:text-blue-100 transition-colors"
              >
                Click to copy code
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How to authenticate:</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>A new tab has opened to GitHub (or click the button below)</li>
                <li>Enter the code shown above: <span className="font-mono font-bold">{flowState.userCode}</span></li>
                <li>Authorize AlmostaCMS to access your repositories</li>
                <li>Return to this page - we'll automatically detect authorization</li>
              </ol>
            </div>

            {/* Open GitHub Button */}
            <a
              href={flowState.verificationUri}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Open GitHub →
            </a>

            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Waiting for authorization...</span>
              </div>
              <span className="text-gray-500 font-mono">
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Cancel */}
            <button
              onClick={handleCancel}
              className="w-full text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600">
              Authentication successful. Redirecting...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'An error occurred during authentication'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            AlmostaCMS uses GitHub Device Flow for secure, decentralized authentication.
            We never see your password and don't require a backend server.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DeviceFlowLogin;
