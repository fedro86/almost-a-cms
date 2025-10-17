import { STORAGE_KEYS } from '../config/constants';

/**
 * Secure token storage utility
 *
 * Uses sessionStorage by default for better security (tokens cleared on tab close)
 * Can be configured to use localStorage for persistent sessions
 */
class TokenStorage {
  private static readonly DEFAULT_EXPIRY_HOURS = 8; // 8 hours

  /**
   * Store access token with expiration
   */
  static setToken(token: string, expiresInSeconds: number = this.DEFAULT_EXPIRY_HOURS * 3600): void {
    const storage = this.getStorage();
    const expiryTime = Date.now() + (expiresInSeconds * 1000);

    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

    console.log('Token stored successfully', {
      expiresIn: `${expiresInSeconds}s`,
      expiresAt: new Date(expiryTime).toISOString()
    });
  }

  /**
   * Retrieve access token if valid
   */
  static getToken(): string | null {
    const storage = this.getStorage();
    const token = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiry = storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

    if (!token || !expiry) {
      return null;
    }

    // Check if token is expired
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime) {
      console.warn('Token expired, clearing storage');
      this.clearToken();
      return null;
    }

    return token;
  }

  /**
   * Clear all authentication data
   */
  static clearToken(): void {
    const storage = this.getStorage();
    storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    storage.removeItem(STORAGE_KEYS.USER_INFO);
    storage.removeItem(STORAGE_KEYS.SELECTED_REPO);

    console.log('Authentication data cleared');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Get time until token expiration (in milliseconds)
   */
  static getTimeUntilExpiry(): number | null {
    const storage = this.getStorage();
    const expiry = storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

    if (!expiry) return null;

    const expiryTime = parseInt(expiry, 10);
    const timeRemaining = expiryTime - Date.now();

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Store OAuth state for CSRF protection
   */
  static setOAuthState(state: string): void {
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state);
  }

  /**
   * Retrieve and validate OAuth state
   */
  static validateOAuthState(receivedState: string): boolean {
    const storedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);

    if (!storedState) {
      console.error('No OAuth state found in storage');
      return false;
    }

    if (storedState !== receivedState) {
      console.error('OAuth state mismatch - possible CSRF attack');
      return false;
    }

    return true;
  }

  /**
   * Cache user information
   */
  static setUserInfo(userInfo: any): void {
    const storage = this.getStorage();
    storage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  }

  /**
   * Retrieve cached user information
   */
  static getUserInfo(): any | null {
    const storage = this.getStorage();
    const userInfo = storage.getItem(STORAGE_KEYS.USER_INFO);

    if (!userInfo) return null;

    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      return null;
    }
  }

  /**
   * Store selected repository
   */
  static setSelectedRepo(owner: string, repo: string): void {
    const storage = this.getStorage();
    storage.setItem(STORAGE_KEYS.SELECTED_REPO, JSON.stringify({ owner, repo }));
  }

  /**
   * Get selected repository
   */
  static getSelectedRepo(): { owner: string; repo: string } | null {
    const storage = this.getStorage();
    const repoData = storage.getItem(STORAGE_KEYS.SELECTED_REPO);

    if (!repoData) return null;

    try {
      return JSON.parse(repoData);
    } catch (error) {
      console.error('Failed to parse repo data:', error);
      return null;
    }
  }

  /**
   * Get storage mechanism (sessionStorage vs localStorage)
   * For now, using sessionStorage for better security
   * Can be made configurable later
   */
  private static getStorage(): Storage {
    // Use sessionStorage for security (cleared on tab close)
    // Change to localStorage for persistent sessions
    return sessionStorage;
  }
}

export default TokenStorage;
