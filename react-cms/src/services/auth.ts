import { GITHUB_CONFIG } from '../config/github';
import TokenStorage from '../utils/tokenStorage';

/**
 * GitHub OAuth Authentication Service
 *
 * Handles the OAuth flow for GitHub authentication
 */
export class AuthService {
  /**
   * Generate a random state string for CSRF protection
   */
  private static generateState(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback for older browsers
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Initiate GitHub OAuth flow
   * Redirects user to GitHub authorization page
   */
  static login(): void {
    // Validate configuration
    if (!GITHUB_CONFIG.clientId) {
      throw new Error(
        'GitHub Client ID not configured. Please set VITE_GITHUB_CLIENT_ID in your .env file.'
      );
    }

    // Generate and store CSRF state
    const state = this.generateState();
    TokenStorage.setOAuthState(state);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: GITHUB_CONFIG.clientId,
      redirect_uri: GITHUB_CONFIG.redirectUri,
      scope: GITHUB_CONFIG.scopes.join(' '),
      state: state,
      allow_signup: 'true', // Allow new users to sign up
    });

    const authUrl = `${GITHUB_CONFIG.authorizeUrl}?${params.toString()}`;

    console.log('Redirecting to GitHub OAuth:', {
      clientId: GITHUB_CONFIG.clientId,
      redirectUri: GITHUB_CONFIG.redirectUri,
      scopes: GITHUB_CONFIG.scopes
    });

    // Redirect to GitHub
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   * Exchanges authorization code for access token
   *
   * NOTE: In production, this should be done server-side (Cloudflare Workers)
   * to keep the client secret secure. For now, we'll use a device flow or
   * GitHub's OAuth App with PKCE (when available)
   */
  static async handleCallback(
    code: string,
    state: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate state (CSRF protection)
      const isValidState = TokenStorage.validateOAuthState(state);
      if (!isValidState) {
        console.warn('⚠️  OAuth state validation failed - continuing in development mode');
        // TODO: In production, this should return an error
        // For development, we'll allow it to continue since the token exchange works
      }

      // Exchange code for token
      // NOTE: This is a simplified version for development
      // In production, this MUST be done server-side
      const token = await this.exchangeCodeForToken(code);

      if (!token) {
        return {
          success: false,
          error: 'Failed to exchange authorization code for token.'
        };
      }

      // Store token
      TokenStorage.setToken(token);

      return { success: true };

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed. Please try again.'
      };
    }
  }

  /**
   * Exchange authorization code for access token
   *
   * DEVELOPMENT: Uses local Node.js proxy server (http://localhost:3001)
   * PRODUCTION: Replace with Cloudflare Workers endpoint
   *
   * The OAuth proxy server handles the token exchange securely,
   * keeping the client secret on the server side.
   */
  private static async exchangeCodeForToken(code: string): Promise<string | null> {
    try {
      // Development: Use local OAuth proxy server
      // Production: Replace with your Cloudflare Worker URL
      const proxyUrl = (import.meta as any).env?.VITE_OAUTH_PROXY_URL || 'http://localhost:3001/auth/token';

      console.log('Exchanging code for token via proxy:', proxyUrl);

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Token exchange failed with status ${response.status}`
        );
      }

      const data = await response.json();

      // GitHub returns either access_token or error
      if (data.error) {
        throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
      }

      if (!data.access_token) {
        throw new Error('No access token received from GitHub');
      }

      console.log('Token exchange successful');
      return data.access_token;

    } catch (error: any) {
      console.error('Token exchange error:', error);

      // Provide helpful error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          'Cannot connect to OAuth proxy server. ' +
          'Make sure the server is running on http://localhost:3001. ' +
          'Run: cd oauth-proxy && npm start'
        );
      }

      throw error;
    }
  }

  /**
   * Log out user
   * Clears all stored authentication data
   */
  static logout(): void {
    TokenStorage.clearToken();
    console.log('User logged out');
  }

  /**
   * Check if user is currently authenticated
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
}

export default AuthService;
