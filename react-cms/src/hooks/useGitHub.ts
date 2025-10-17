import { useState } from 'react';
import GitHubApiService from '../services/github-api';

/**
 * Custom hook for GitHub API operations
 * Provides methods to interact with GitHub repositories
 */
export function useGitHub() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * List user's repositories
   */
  const listRepos = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.listUserRepos();

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch repositories');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if repository exists
   */
  const checkRepo = async (owner: string, repo: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.checkRepoExists(owner, repo);

      if (result.success) {
        return result.exists;
      } else {
        setError(result.error || 'Failed to check repository');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create repository from template
   */
  const createRepo = async (
    templateOwner: string,
    templateRepo: string,
    newRepoName: string,
    description?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.createRepoFromTemplate(
        templateOwner,
        templateRepo,
        newRepoName,
        description
      );

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to create repository');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get file content
   */
  const getFile = async (owner: string, repo: string, path: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.getFileContent(owner, repo, path);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch file');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update file content
   */
  const updateFile = async (
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha?: string,
    message?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.updateFileContent(
        owner,
        repo,
        path,
        content,
        sha,
        message
      );

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to update file');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enable GitHub Pages
   */
  const enablePages = async (owner: string, repo: string, branch: string = 'main') => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.enableGitHubPages(owner, repo, branch);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to enable Pages');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get Pages info
   */
  const getPagesInfo = async (owner: string, repo: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.getGitHubPagesInfo(owner, repo);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch Pages info');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Configure custom domain
   */
  const setCustomDomain = async (owner: string, repo: string, domain: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GitHubApiService.updatePagesCustomDomain(owner, repo, domain);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to configure custom domain');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    listRepos,
    checkRepo,
    createRepo,
    getFile,
    updateFile,
    enablePages,
    getPagesInfo,
    setCustomDomain,
    clearError,
  };
}

export default useGitHub;
