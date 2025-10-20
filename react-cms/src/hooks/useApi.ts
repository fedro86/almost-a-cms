import { useState, useCallback } from 'react';
import GitHubApiService from '../services/github-api';
import { useRepo } from './useRepo';
import { ContentData } from '../types';

/**
 * API Hook - Now using GitHub API instead of Flask backend
 *
 * Loads and saves content directly to the user's GitHub repository
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeRepo } = useRepo();

  /**
   * Load content from GitHub repository
   * Reads the JSON file from data/ folder in the active repo
   * Supports both root (/) and docs (/docs) deployment paths
   */
  const loadContent = useCallback(async (filename: string): Promise<ContentData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate active repository
      if (!activeRepo) {
        throw new Error('No active repository. Please create a portfolio first.');
      }

      // Construct file path in GitHub repo
      // If repoPath is "/docs", prepend "docs/" to the path
      const repoPath = activeRepo.repoPath || '/';
      const basePath = repoPath === '/docs' ? 'docs/' : '';
      const filePath = `${basePath}data/${filename}.json`;

      console.log(`Loading ${filePath} from ${activeRepo.owner}/${activeRepo.name} (repoPath: ${repoPath})`);

      // Fetch file from GitHub
      const result = await GitHubApiService.getFileContent(
        activeRepo.owner,
        activeRepo.name,
        filePath
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to load content from GitHub');
      }

      // Parse JSON content
      const contentData = JSON.parse(result.data!.content);

      console.log(`✅ Loaded ${filename}:`, contentData);

      return contentData;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load content';
      console.error('Load content error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeRepo]);

  /**
   * Save content to GitHub repository
   * Commits the changes directly to the user's repo
   * Supports both root (/) and docs (/docs) deployment paths
   */
  const saveContent = useCallback(async (
    filename: string,
    data: ContentData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Validate active repository
      if (!activeRepo) {
        throw new Error('No active repository. Please create a portfolio first.');
      }

      // Construct file path
      // If repoPath is "/docs", prepend "docs/" to the path
      const repoPath = activeRepo.repoPath || '/';
      const basePath = repoPath === '/docs' ? 'docs/' : '';
      const filePath = `${basePath}data/${filename}.json`;

      console.log(`Saving ${filePath} to ${activeRepo.owner}/${activeRepo.name} (repoPath: ${repoPath})`);

      // First, get the current file to obtain its SHA (required for updates)
      const currentFile = await GitHubApiService.getFileContent(
        activeRepo.owner,
        activeRepo.name,
        filePath
      );

      const sha = currentFile.success ? currentFile.data?.sha : undefined;

      // Convert data to JSON string with pretty formatting
      const content = JSON.stringify(data, null, 2);

      // Commit message
      const commitMessage = `Update ${filename} via AlmostaCMS`;

      // Update file on GitHub
      const result = await GitHubApiService.updateFileContent(
        activeRepo.owner,
        activeRepo.name,
        filePath,
        content,
        sha,
        commitMessage
      );

      if (!result.success) {
        throw new Error('error' in result ? result.error : 'Failed to save content to GitHub');
      }

      console.log(`✅ Saved ${filename} - Commit:`, 'data' in result ? result.data?.commitUrl : '');

      return true;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save content';
      console.error('Save content error:', err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeRepo]);

  /**
   * Trigger GitHub Actions workflow to regenerate site
   * This will rebuild the HTML and deploy to GitHub Pages
   */
  const generateHtml = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Validate active repository
      if (!activeRepo) {
        throw new Error('No active repository. Please create a portfolio first.');
      }

      console.log('Triggering site rebuild for', activeRepo.fullName);

      // Note: This requires a workflow file to exist in the repo
      // If no workflow exists, this will fail gracefully
      const result = await GitHubApiService.triggerWorkflow(
        activeRepo.owner,
        activeRepo.name,
        'deploy.yml' // Name of the GitHub Actions workflow
      );

      if (!result.success) {
        // Don't treat as critical error - workflow might not exist yet
        console.warn('Workflow trigger failed (workflow may not exist):', 'error' in result ? result.error : 'Unknown error');

        // Return success anyway since the file was saved
        // The workflow will auto-trigger on next push if it exists
        return true;
      }

      console.log('✅ Workflow triggered successfully');
      return true;

    } catch (err: any) {
      // Non-critical error - log but don't fail
      console.warn('Generate HTML warning:', err.message);
      return true; // Still return success
    } finally {
      setLoading(false);
    }
  }, [activeRepo]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    loadContent,
    saveContent,
    generateHtml,
    clearError,
  };
};

export default useApi;
