import { Octokit } from '@octokit/rest';
import TokenStorage from '../utils/tokenStorage';
import { GITHUB_CONFIG } from '../config/github';

/**
 * GitHub API Service
 * Wrapper around Octokit for all GitHub API interactions
 */
export class GitHubApiService {
  private octokit: Octokit | null = null;

  /**
   * Initialize Octokit instance with current auth token
   */
  private getOctokit(): Octokit {
    const token = TokenStorage.getToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in with GitHub.');
    }

    // Create new instance if needed (token might have changed)
    if (!this.octokit) {
      this.octokit = new Octokit({
        auth: token,
        userAgent: 'AlmostaCMS/2.0',
        baseUrl: GITHUB_CONFIG.apiBaseUrl,
      });
    }

    return this.octokit;
  }

  /**
   * Clear Octokit instance (e.g., on logout)
   */
  clearInstance(): void {
    this.octokit = null;
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser() {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.users.getAuthenticated();

      // Cache user info
      TokenStorage.setUserInfo(data);

      return {
        success: true,
        data: {
          login: data.login,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          publicRepos: data.public_repos,
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch user information');
    }
  }

  /**
   * List user's repositories
   */
  async listUserRepos(username?: string) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return {
        success: true,
        data: data.map(repo => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          private: repo.private,
          updatedAt: repo.updated_at,
          hasPages: repo.has_pages,
        }))
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch repositories');
    }
  }

  /**
   * Check if a specific repository exists
   */
  async checkRepoExists(owner: string, repo: string) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.get({ owner, repo });
      return { success: true, exists: true, data };
    } catch (error: any) {
      if (error.status === 404) {
        return { success: true, exists: false };
      }
      return this.handleError(error, 'Failed to check repository');
    }
  }

  /**
   * Create repository from template
   */
  async createRepoFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newRepoName: string,
    description?: string
  ) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.createUsingTemplate({
        template_owner: templateOwner,
        template_repo: templateRepo,
        name: newRepoName,
        description: description || 'My portfolio website created with AlmostaCMS',
        include_all_branches: false,
        private: false,
      });

      return {
        success: true,
        data: {
          name: data.name,
          fullName: data.full_name,
          url: data.html_url,
          cloneUrl: data.clone_url,
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to create repository');
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner: string, repo: string, path: string) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      // Ensure data is a file (not directory)
      if ('type' in data && data.type === 'file' && 'content' in data) {
        // Decode base64 content
        const content = atob(data.content);

        return {
          success: true,
          data: {
            content,
            sha: data.sha,
            size: data.size,
          }
        };
      }

      return {
        success: false,
        error: 'Path is not a file'
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch file content');
    }
  }

  /**
   * List files in a directory
   */
  async listDirectoryContents(owner: string, repo: string, path: string) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      // Ensure data is an array (directory listing)
      if (Array.isArray(data)) {
        return {
          success: true,
          data: data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size,
            sha: item.sha,
            downloadUrl: item.download_url,
          }))
        };
      }

      return {
        success: false,
        error: 'Path is not a directory'
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to list directory contents');
    }
  }

  /**
   * Create or update file in repository
   */
  async updateFileContent(
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha?: string,
    message?: string
  ) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: message || `Update ${path} via AlmostaCMS`,
        content: btoa(content), // Encode to base64
        sha, // Required for updates
      });

      return {
        success: true,
        data: {
          sha: data.content?.sha,
          commitUrl: data.commit.html_url,
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to update file');
    }
  }

  /**
   * Upload binary file (like images) to repository
   * Content should be base64-encoded string (without the data:... prefix)
   */
  async uploadBinaryFile(
    owner: string,
    repo: string,
    path: string,
    base64Content: string,
    sha?: string,
    message?: string
  ) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: message || `Upload ${path} via AlmostaCMS`,
        content: base64Content, // Already base64-encoded, don't encode again
        sha, // Required for updates
      });

      return {
        success: true,
        data: {
          sha: data.content?.sha,
          commitUrl: data.commit.html_url,
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to upload file');
    }
  }

  /**
   * Enable GitHub Pages for a repository
   */
  async enableGitHubPages(owner: string, repo: string, branch: string = 'main') {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.createPagesSite({
        owner,
        repo,
        source: {
          branch,
          path: '/' as any, // Type issue with Octokit
        },
      });

      return {
        success: true,
        data: {
          url: data.html_url,
          status: data.status,
        }
      };
    } catch (error: any) {
      // Pages might already be enabled
      if (error.status === 409) {
        return this.getGitHubPagesInfo(owner, repo);
      }
      return this.handleError(error, 'Failed to enable GitHub Pages');
    }
  }

  /**
   * Get GitHub Pages information
   */
  async getGitHubPagesInfo(owner: string, repo: string) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.getPages({ owner, repo });

      return {
        success: true,
        data: {
          url: data.html_url,
          status: data.status,
          customDomain: data.cname || null,
        }
      };
    } catch (error: any) {
      if (error.status === 404) {
        return {
          success: true,
          data: { enabled: false }
        };
      }
      return this.handleError(error, 'Failed to fetch Pages info');
    }
  }

  /**
   * Update GitHub Pages with custom domain
   */
  async updatePagesCustomDomain(owner: string, repo: string, domain: string) {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.updateInformationAboutPagesSite({
        owner,
        repo,
        cname: domain,
      });

      return {
        success: true,
        data: {
          url: data.html_url,
          customDomain: data.cname,
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to configure custom domain');
    }
  }

  /**
   * Trigger GitHub Actions workflow
   */
  async triggerWorkflow(owner: string, repo: string, workflowId: string) {
    const octokit = this.getOctokit();

    try {
      await octokit.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref: 'main',
      });

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'Failed to trigger workflow');
    }
  }

  /**
   * Get API rate limit status
   */
  async getRateLimitStatus() {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.rateLimit.get();

      return {
        success: true,
        data: {
          limit: data.rate.limit,
          remaining: data.rate.remaining,
          reset: new Date(data.rate.reset * 1000),
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch rate limit');
    }
  }

  /**
   * Check if a repository is an AlmostaCMS project
   * Looks for .almostacms.json config file
   */
  async isAlmostaCMSProject(owner: string, repo: string): Promise<boolean> {
    try {
      const result = await this.getFileContent(owner, repo, '.almostacms.json');

      if (!result.success) {
        return false;
      }

      if (!('data' in result) || !result.data) {
        return false;
      }

      // Try to parse the config
      const config = JSON.parse(result.data.content);

      // Verify it's a valid AlmostaCMS project
      return config.generator === 'almostacms' && config.version;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get AlmostaCMS project configuration
   */
  async getProjectConfig(owner: string, repo: string) {
    const result = await this.getFileContent(owner, repo, '.almostacms.json');

    if (!result.success) {
      return {
        success: false,
        error: 'Project configuration not found'
      };
    }

    if (!('data' in result) || !result.data) {
      return {
        success: false,
        error: 'Project configuration not found'
      };
    }

    try {
      const config = JSON.parse(result.data.content);

      return {
        success: true,
        data: {
          config,
          sha: result.data.sha
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Invalid project configuration'
      };
    }
  }

  /**
   * Update AlmostaCMS project configuration
   */
  async updateProjectConfig(
    owner: string,
    repo: string,
    config: any,
    sha: string
  ) {
    // Update lastModified timestamp
    config.lastModified = new Date().toISOString();

    const content = JSON.stringify(config, null, 2);

    return await this.updateFileContent(
      owner,
      repo,
      '.almostacms.json',
      content,
      sha,
      'Update AlmostaCMS project configuration'
    );
  }

  /**
   * Scan user's repositories for AlmostaCMS projects
   * Returns list of projects with their configurations
   */
  async listAlmostaCMSProjects() {
    const octokit = this.getOctokit();

    try {
      // Get all user repositories
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      const projects = [];

      // Check each repo for .almostacms.json
      for (const repo of repos) {
        const isProject = await this.isAlmostaCMSProject(repo.owner.login, repo.name);

        if (isProject) {
          const configResult = await this.getProjectConfig(repo.owner.login, repo.name);

          if (configResult.success && 'data' in configResult && configResult.data) {
            const pagesInfo = await this.getGitHubPagesInfo(repo.owner.login, repo.name);

            projects.push({
              repo: {
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                url: repo.html_url,
                private: repo.private,
                updatedAt: repo.updated_at,
                createdAt: repo.created_at,
                owner: repo.owner.login,
              },
              config: configResult.data.config,
              configSha: configResult.data.sha,
              pages: pagesInfo.success && 'data' in pagesInfo ? pagesInfo.data : null,
            });
          }
        }
      }

      return {
        success: true,
        data: projects
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to scan for AlmostaCMS projects');
    }
  }

  /**
   * Initialize a new AlmostaCMS project
   * Creates .almostacms.json in an existing repository
   */
  async initializeProject(
    owner: string,
    repo: string,
    projectType: string = 'personal-website',
    metadata?: {
      title?: string;
      description?: string;
      author?: string;
    }
  ) {
    const octokit = this.getOctokit();

    try {
      // Get repository info for creation date
      const { data: repoData } = await octokit.repos.get({ owner, repo });

      const config = {
        version: '1.0.0',
        generator: 'almostacms',
        projectType,
        created: repoData.created_at,
        lastModified: new Date().toISOString(),
        config: {
          template: 'vcard-portfolio',
          templateVersion: '1.0.0',
          customDomain: null,
          theme: 'default',
          sections: ['about', 'resume', 'portfolio', 'blog', 'contact', 'navbar', 'sidebar']
        },
        metadata: {
          title: metadata?.title || 'My Website',
          description: metadata?.description || `Website created with AlmostaCMS`,
          author: metadata?.author || owner,
          tags: ['portfolio', 'resume', 'almostacms']
        }
      };

      const content = JSON.stringify(config, null, 2);

      const result = await this.updateFileContent(
        owner,
        repo,
        '.almostacms.json',
        content,
        undefined,
        'Initialize AlmostaCMS project'
      );

      if (!result.success) {
        return result;
      }

      // Also add GitHub repository topic
      await octokit.repos.replaceAllTopics({
        owner,
        repo,
        names: ['almostacms', 'portfolio', 'github-pages']
      });

      return {
        success: true,
        data: config
      };
    } catch (error: any) {
      return this.handleError(error, 'Failed to initialize AlmostaCMS project');
    }
  }

  /**
   * Generic error handler
   */
  private handleError(error: any, defaultMessage: string) {
    console.error('GitHub API Error:', error);

    let message = defaultMessage;

    if (error.status === 401) {
      message = 'Authentication failed. Please log in again.';
      TokenStorage.clearToken();
    } else if (error.status === 403) {
      if (error.response?.headers?.['x-ratelimit-remaining'] === '0') {
        const reset = error.response.headers['x-ratelimit-reset'];
        const resetTime = new Date(parseInt(reset) * 1000);
        message = `API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`;
      } else {
        message = 'Permission denied. Check repository access.';
      }
    } else if (error.status === 404) {
      message = 'Resource not found.';
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
    };
  }
}

// Export singleton instance
export default new GitHubApiService();
