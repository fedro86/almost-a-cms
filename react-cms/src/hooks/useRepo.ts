import { useState, useEffect } from 'react';
import RepoContextService from '../services/repo-context';

/**
 * Repository information
 */
export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  hasPages: boolean;
  pagesUrl?: string;
  repoPath?: string;  // Repository path where files are located: "/" or "/docs"
}

const STORAGE_KEY = 'almostacms_active_repo';

/**
 * Custom hook for managing active repository state
 * Handles loading, storing, and updating the active repository
 *
 * In embedded mode, automatically detects repo from URL/config
 * In centralized mode, uses localStorage selection
 */
export function useRepo() {
  const [activeRepo, setActiveRepo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmbedded, setIsEmbedded] = useState(false);

  // Load active repo on mount
  useEffect(() => {
    const loadActiveRepo = async () => {
      try {
        // Check if we're in embedded mode
        const embedded = RepoContextService.isEmbeddedMode();
        setIsEmbedded(embedded);

        if (embedded) {
          // Embedded mode: Auto-detect from URL/config
          console.log('[useRepo] Embedded mode detected - auto-detecting repository...');
          const context = await RepoContextService.detectContext();

          if (context) {
            const repo: RepoInfo = {
              owner: context.owner,
              name: context.repo,
              fullName: `${context.owner}/${context.repo}`,
              url: `https://github.com/${context.owner}/${context.repo}`,
              hasPages: true, // Assume Pages enabled since admin is accessible
              pagesUrl: `https://${context.owner}.github.io${context.deployPath}`,
              repoPath: context.repoPath, // "/" for root, "/docs" for docs folder
            };
            setActiveRepo(repo);
            console.log('[useRepo] Repository auto-detected:', repo);
          } else {
            console.warn('[useRepo] Could not auto-detect repository context');
          }
        } else {
          // Centralized mode: Load from localStorage
          console.log('[useRepo] Centralized mode - loading from localStorage...');
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const repo = JSON.parse(stored);
            setActiveRepo(repo);
            console.log('[useRepo] Repository loaded from storage:', repo);
          }
        }
      } catch (error) {
        console.error('[useRepo] Failed to load active repo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveRepo();
  }, []);

  /**
   * Set the active repository
   */
  const selectRepo = (repo: RepoInfo) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(repo));
      setActiveRepo(repo);
    } catch (error) {
      console.error('Failed to save active repo:', error);
    }
  };

  /**
   * Clear the active repository
   */
  const clearRepo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setActiveRepo(null);
    } catch (error) {
      console.error('Failed to clear active repo:', error);
    }
  };

  /**
   * Update Pages URL for active repo
   */
  const updatePagesUrl = (url: string) => {
    if (activeRepo) {
      const updated = {
        ...activeRepo,
        hasPages: true,
        pagesUrl: url,
      };
      selectRepo(updated);
    }
  };

  return {
    activeRepo,
    loading,
    selectRepo,
    clearRepo,
    updatePagesUrl,
    hasActiveRepo: activeRepo !== null,
    isEmbedded, // True if admin is embedded in a site, false if centralized
  };
}

export default useRepo;
