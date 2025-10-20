/**
 * GitHub Device Flow Configuration
 *
 * To set up GitHub Device Flow:
 * 1. Go to https://github.com/settings/developers
 * 2. Click "New OAuth App" (or edit existing)
 * 3. Fill in:
 *    - Application name: AlmostaCMS (or your choice)
 *    - Homepage URL: http://localhost:3000 (for dev) or https://almostacms.com (for prod)
 *    - Authorization callback URL: Not needed for Device Flow, but set to http://localhost:3000 for compatibility
 * 4. Enable "Device Flow" in your OAuth App settings
 * 5. Copy the Client ID to .env file
 *
 * Device Flow Benefits:
 * - No backend server required (zero infrastructure cost)
 * - No client secret exposure (more secure)
 * - Works with decentralized architecture
 * - Better for CLI and embedded scenarios
 */

export const GITHUB_CONFIG = {
  // OAuth App Client ID (public, safe to expose)
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',

  // OAuth scopes required for repository management
  scopes: ['repo', 'workflow'] as const,

  // Template repositories for site generation
  templateOwner: import.meta.env.VITE_TEMPLATE_OWNER || 'almostacms',
  templateRepo: import.meta.env.VITE_TEMPLATE_REPO || 'vcard-portfolio-template',

  // Default portfolio repo name
  defaultRepoName: 'my-portfolio',

  // GitHub API base URL
  apiBaseUrl: 'https://api.github.com',

  // Legacy OAuth URLs (kept for backwards compatibility, not used with Device Flow)
  authorizeUrl: 'https://github.com/login/oauth/authorize',
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback',
};

/**
 * Validates that required configuration is present
 */
export function validateGitHubConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!GITHUB_CONFIG.clientId) {
    errors.push('VITE_GITHUB_CLIENT_ID is not set. Please create a .env file with your GitHub OAuth Client ID.');
  }

  if (!GITHUB_CONFIG.redirectUri) {
    errors.push('VITE_OAUTH_REDIRECT_URI is not set.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
