/**
 * Repository Context Detection Service
 *
 * Automatically detects which GitHub repository the admin is managing
 * based on the URL, configuration files, or localStorage.
 *
 * This enables the embedded admin to work independently without
 * centralized configuration.
 */

interface RepoContext {
  owner: string;
  repo: string;
  deployPath: string;
  adminPath: string;
  detectionMethod: 'url' | 'config' | 'localStorage' | 'manual';
}

interface AlmostaCMSConfig {
  github?: {
    owner: string;
    repo: string;
  };
  deployment?: {
    path: string;
    adminPath: string;
    url?: string;
  };
}

export class RepoContextService {
  private static readonly STORAGE_KEY = 'almostacms_repo_context';
  private static readonly CONFIG_PATHS = [
    '/.almostacms.json',
    '/data/.almostacms.json',
    '/../.almostacms.json',
  ];

  /**
   * Detect repository context automatically
   * Tries multiple detection methods in order of reliability
   */
  static async detectContext(): Promise<RepoContext | null> {
    console.log('[RepoContext] Starting context detection...');

    // Method 1: Try URL-based detection (most reliable for GitHub Pages)
    const urlContext = this.detectFromURL();
    if (urlContext) {
      console.log('[RepoContext] Detected from URL:', urlContext);
      this.saveContext(urlContext);
      return urlContext;
    }

    // Method 2: Try loading .almostacms.json config
    const configContext = await this.detectFromConfig();
    if (configContext) {
      console.log('[RepoContext] Detected from config:', configContext);
      this.saveContext(configContext);
      return configContext;
    }

    // Method 3: Try localStorage (previously saved context)
    const storedContext = this.detectFromStorage();
    if (storedContext) {
      console.log('[RepoContext] Loaded from storage:', storedContext);
      return storedContext;
    }

    console.warn('[RepoContext] Could not detect repository context');
    return null;
  }

  /**
   * Detect context from URL patterns
   * Handles GitHub Pages and custom domains
   */
  private static detectFromURL(): RepoContext | null {
    const url = new URL(window.location.href);
    const hostname = url.hostname;
    const pathname = url.pathname;

    // Pattern 1: GitHub Pages with repo - username.github.io/repo-name/admin
    const ghPagesMatch = hostname.match(/^(.+?)\.github\.io$/);
    if (ghPagesMatch) {
      const username = ghPagesMatch[1];
      const pathParts = pathname.split('/').filter(Boolean);

      // Remove 'admin' from the end
      const adminIndex = pathParts.findIndex(part => part === 'admin');
      const repoPath = adminIndex > 0 ? pathParts.slice(0, adminIndex) : pathParts.slice(0, -1);

      if (repoPath.length > 0) {
        // Project repo: username.github.io/my-portfolio/admin
        const repo = repoPath[0]; // Use first segment as repo name
        return {
          owner: username,
          repo: repo,
          deployPath: `/${repo}/`,
          adminPath: `/${repo}/admin/`,
          detectionMethod: 'url',
        };
      } else {
        // User/org repo: username.github.io/admin
        return {
          owner: username,
          repo: `${username}.github.io`,
          deployPath: '/',
          adminPath: '/admin/',
          detectionMethod: 'url',
        };
      }
    }

    // Pattern 2: localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[RepoContext] Localhost detected - will try config or storage');
      return null; // Will fall through to config or storage detection
    }

    // Pattern 3: Custom domain (need config file to know repo)
    console.log('[RepoContext] Custom domain detected - will try config');
    return null; // Will fall through to config detection
  }

  /**
   * Detect context from .almostacms.json configuration file
   */
  private static async detectFromConfig(): Promise<RepoContext | null> {
    for (const configPath of this.CONFIG_PATHS) {
      try {
        console.log(`[RepoContext] Trying to load config from ${configPath}...`);
        const response = await fetch(configPath);

        if (!response.ok) {
          continue;
        }

        const config: AlmostaCMSConfig = await response.json();

        if (config.github?.owner && config.github?.repo) {
          return {
            owner: config.github.owner,
            repo: config.github.repo,
            deployPath: config.deployment?.path || '/',
            adminPath: config.deployment?.adminPath || '/admin/',
            detectionMethod: 'config',
          };
        }
      } catch (error) {
        // Config file not found or invalid, try next path
        continue;
      }
    }

    return null;
  }

  /**
   * Detect context from localStorage (previously saved)
   */
  private static detectFromStorage(): RepoContext | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const context: RepoContext = JSON.parse(stored);

      // Validate stored context
      if (context.owner && context.repo && context.deployPath && context.adminPath) {
        return context;
      }
    } catch (error) {
      console.error('[RepoContext] Failed to load from storage:', error);
    }

    return null;
  }

  /**
   * Save context to localStorage for future use
   */
  private static saveContext(context: RepoContext): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
      console.log('[RepoContext] Context saved to localStorage');
    } catch (error) {
      console.error('[RepoContext] Failed to save context:', error);
    }
  }

  /**
   * Manually set repository context
   * Used when auto-detection fails or user wants to override
   */
  static setContext(owner: string, repo: string, deployPath: string = '/', adminPath: string = '/admin/'): RepoContext {
    const context: RepoContext = {
      owner,
      repo,
      deployPath,
      adminPath,
      detectionMethod: 'manual',
    };

    this.saveContext(context);
    console.log('[RepoContext] Context manually set:', context);

    return context;
  }

  /**
   * Clear saved context
   */
  static clearContext(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('[RepoContext] Context cleared');
  }

  /**
   * Get current context (from memory, doesn't re-detect)
   */
  static getCurrentContext(): RepoContext | null {
    return this.detectFromStorage();
  }

  /**
   * Check if admin is running in embedded mode
   * (vs centralized almostacms.com)
   */
  static isEmbeddedMode(): boolean {
    const url = new URL(window.location.href);

    // If we're on almostacms.com or localhost:3000, we're centralized
    if (
      url.hostname === 'almostacms.com' ||
      url.hostname === 'www.almostacms.com' ||
      (url.hostname === 'localhost' && url.port === '3000')
    ) {
      return false;
    }

    // Otherwise, we're embedded
    return true;
  }

  /**
   * Validate that a context is valid and accessible
   */
  static async validateContext(context: RepoContext, token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${context.owner}/${context.repo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('[RepoContext] Validation failed:', error);
      return false;
    }
  }
}

export default RepoContextService;
export type { RepoContext, AlmostaCMSConfig };
