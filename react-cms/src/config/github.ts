/**
 * GitHub OAuth Configuration
 *
 * To set up GitHub OAuth:
 * 1. Go to https://github.com/settings/developers
 * 2. Click "New OAuth App"
 * 3. Fill in:
 *    - Application name: AlmostaCMS (or your choice)
 *    - Homepage URL: http://localhost:3000 (for dev) or https://almostacms.com (for prod)
 *    - Authorization callback URL: http://localhost:3000/auth/callback (for dev)
 * 4. Copy the Client ID to .env file
 */

export const GITHUB_CONFIG = {
  // OAuth App Client ID (public, safe to expose)
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',

  // Redirect URI (must match GitHub OAuth App settings)
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback',

  // OAuth scopes required
  scopes: ['repo', 'workflow'] as const,

  // Template repository for new portfolios
  templateOwner: import.meta.env.VITE_TEMPLATE_OWNER || 'almostacms',
  templateRepo: import.meta.env.VITE_TEMPLATE_REPO || 'vcard-portfolio-template',

  // Default portfolio repo name
  defaultRepoName: 'my-portfolio',

  // GitHub API base URL
  apiBaseUrl: 'https://api.github.com',

  // OAuth authorize URL
  authorizeUrl: 'https://github.com/login/oauth/authorize',

  // Note: Client secret should NEVER be in frontend code
  // For production, use Cloudflare Workers or similar to exchange tokens
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
