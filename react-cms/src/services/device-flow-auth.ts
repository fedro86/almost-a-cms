import TokenStorage from '../utils/tokenStorage';

/**
 * GitHub Device Flow Authentication Service
 *
 * Implements GitHub's Device Flow OAuth which is perfect for:
 * - Decentralized architecture (no backend server needed)
 * - CLI applications and devices with limited input
 * - Better security (no client secret exposure)
 *
 * Flow:
 * 1. Request device code from GitHub
 * 2. Show user the code and verification URL
 * 3. Poll GitHub API until user authorizes
 * 4. Receive access token directly
 *
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface DeviceFlowState {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresAt: number;
  interval: number;
}

export interface DeviceFlowStatus {
  status: 'pending' | 'authorized' | 'expired' | 'error';
  userCode?: string;
  verificationUri?: string;
  expiresIn?: number;
  error?: string;
}

/**
 * Device Flow Authentication Service
 */
export class DeviceFlowAuthService {
  // Use proxy to bypass CORS (GitHub Device Flow API doesn't allow browser CORS)
  private static readonly PROXY_URL = import.meta.env.VITE_GITHUB_PROXY_URL || '';
  private static readonly DEVICE_CODE_URL = 'https://github.com/login/device/code';
  private static readonly ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
  private static readonly REQUIRED_SCOPES = ['repo', 'workflow'];

  private static pollingTimer: number | null = null;

  /**
   * Initiate Device Flow
   * Returns the user code and verification URL to display to the user
   */
  static async initiateDeviceFlow(clientId: string): Promise<DeviceFlowStatus> {
    try {
      if (!clientId) {
        throw new Error('GitHub Client ID not configured. Please set VITE_GITHUB_CLIENT_ID in your .env file.');
      }

      console.log('Initiating GitHub Device Flow...');

      // Prepare request body for proxy
      const requestBody = {
        endpoint: 'device_code',
        params: {
          client_id: clientId,
          scope: this.REQUIRED_SCOPES.join(' '),
        },
      };

      // Request device code from GitHub via CORS proxy
      const targetUrl = this.PROXY_URL || this.DEVICE_CODE_URL;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.PROXY_URL ? requestBody : requestBody.params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Device code request failed:', errorText);
        throw new Error(`Device code request failed: ${response.status} ${response.statusText}`);
      }

      const data: DeviceCodeResponse = await response.json();

      // Store device flow state
      const state: DeviceFlowState = {
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresAt: Date.now() + (data.expires_in * 1000),
        interval: data.interval,
      };

      TokenStorage.setDeviceFlowState(state);

      console.log('Device Flow initiated:', {
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
      });

      return {
        status: 'pending',
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
      };

    } catch (error: any) {
      console.error('Device Flow initiation error:', error);
      return {
        status: 'error',
        error: error.message || 'Failed to initiate device flow',
      };
    }
  }

  /**
   * Start polling for access token
   * Polls GitHub API until user authorizes or flow expires
   *
   * @param clientId - GitHub OAuth Client ID
   * @param onSuccess - Callback when access token is received
   * @param onError - Callback when error occurs or flow expires
   */
  static startPolling(
    clientId: string,
    onSuccess: (token: string) => void,
    onError: (error: string) => void
  ): void {
    const state = TokenStorage.getDeviceFlowState();

    if (!state) {
      onError('Device flow state not found. Please restart the authentication process.');
      return;
    }

    // Check if already expired
    if (Date.now() >= state.expiresAt) {
      TokenStorage.clearDeviceFlowState();
      onError('Device flow expired. Please restart the authentication process.');
      return;
    }

    console.log('Starting device flow polling...');

    // Poll GitHub API
    let pollInterval = state.interval * 1000; // Convert to milliseconds
    let pollCount = 0;

    const poll = async () => {
      pollCount++;

      try {
        // Check if expired
        if (Date.now() >= state.expiresAt) {
          this.stopPolling();
          TokenStorage.clearDeviceFlowState();
          onError('Authentication timed out. Please try again.');
          return;
        }

        console.log(`Polling for access token (attempt ${pollCount})...`);

        // Prepare request body for proxy
        const requestBody = {
          endpoint: 'access_token',
          params: {
            client_id: clientId,
            device_code: state.deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          },
        };

        const targetUrl = this.PROXY_URL || this.ACCESS_TOKEN_URL;
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.PROXY_URL ? requestBody : requestBody.params),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Token request failed:', errorText);
          throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response states
        if (data.error) {
          switch (data.error) {
            case 'authorization_pending':
              // User hasn't authorized yet, continue polling
              console.log('Authorization pending, continuing to poll...');
              break;

            case 'slow_down':
              // We're polling too fast, GitHub wants us to slow down
              console.warn('Polling too fast, slowing down...');
              // GitHub adds 5 seconds to the interval - we need to adjust
              this.stopPolling();
              pollInterval += 5000; // Add 5 seconds as per GitHub spec
              console.log(`Adjusted poll interval to ${pollInterval / 1000} seconds`);
              this.pollingTimer = window.setInterval(poll, pollInterval);
              break;

            case 'expired_token':
              this.stopPolling();
              TokenStorage.clearDeviceFlowState();
              onError('Device code expired. Please restart the authentication process.');
              return;

            case 'access_denied':
              this.stopPolling();
              TokenStorage.clearDeviceFlowState();
              onError('Access denied. You cancelled the authorization.');
              return;

            default:
              this.stopPolling();
              TokenStorage.clearDeviceFlowState();
              onError(`Authentication error: ${data.error_description || data.error}`);
              return;
          }
        } else if (data.access_token) {
          // Success! We have the access token
          this.stopPolling();
          TokenStorage.clearDeviceFlowState();
          TokenStorage.setToken(data.access_token);
          console.log('Device Flow authentication successful!');
          onSuccess(data.access_token);
          return;
        }

      } catch (error: any) {
        console.error('Polling error:', error);
        this.stopPolling();
        TokenStorage.clearDeviceFlowState();
        onError(error.message || 'Failed to complete authentication');
        return;
      }
    };

    // Start polling
    poll(); // Initial poll
    this.pollingTimer = window.setInterval(poll, pollInterval);
  }

  /**
   * Stop polling for access token
   */
  static stopPolling(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      console.log('Stopped device flow polling');
    }
  }

  /**
   * Get current device flow state
   */
  static getFlowState(): DeviceFlowState | null {
    return TokenStorage.getDeviceFlowState();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenStorage.isAuthenticated();
  }

  /**
   * Get current access token
   */
  static getToken(): string | null {
    return TokenStorage.getToken();
  }

  /**
   * Log out user
   */
  static logout(): void {
    this.stopPolling();
    TokenStorage.clearToken();
    TokenStorage.clearDeviceFlowState();
    console.log('User logged out');
  }
}

export default DeviceFlowAuthService;
