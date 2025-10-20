/**
 * Application-wide constants
 */

export const APP_NAME = 'AlmostaCMS';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Create beautiful portfolio websites with GitHub Pages';

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'github_access_token',
  TOKEN_EXPIRY: 'token_expiry',
  OAUTH_STATE: 'oauth_state',
  DEVICE_FLOW_STATE: 'device_flow_state',

  // User data (cached)
  USER_INFO: 'user_info',
  SELECTED_REPO: 'selected_repo',
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD: '/dashboard',
  SETUP: '/setup',
  EDIT: '/edit/:section',
  DEPLOY: '/deploy',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  // GitHub API rate limit (requests per hour for authenticated users)
  RATE_LIMIT: 5000,

  // Request timeout (ms)
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
} as const;

/**
 * Content sections
 */
export const CONTENT_SECTIONS = [
  { id: 'about', label: 'About', icon: 'UserIcon', description: 'Personal information and bio' },
  { id: 'portfolio', label: 'Portfolio', icon: 'BriefcaseIcon', description: 'Showcase your work' },
  { id: 'resume', label: 'Resume', icon: 'DocumentTextIcon', description: 'Education and experience' },
  { id: 'blog', label: 'Blog', icon: 'NewspaperIcon', description: 'Articles and posts' },
  { id: 'contact', label: 'Contact', icon: 'EnvelopeIcon', description: 'Contact information' },
  { id: 'navbar', label: 'Navigation', icon: 'Bars3Icon', description: 'Menu items' },
  { id: 'sidebar', label: 'Sidebar', icon: 'RectangleStackIcon', description: 'Sidebar content' },
] as const;
