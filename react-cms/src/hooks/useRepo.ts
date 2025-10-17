import { useState, useEffect } from 'react';

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
}

const STORAGE_KEY = 'almostacms_active_repo';

/**
 * Custom hook for managing active repository state
 * Handles loading, storing, and updating the active repository
 */
export function useRepo() {
  const [activeRepo, setActiveRepo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Load active repo from localStorage on mount
  useEffect(() => {
    const loadActiveRepo = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const repo = JSON.parse(stored);
          setActiveRepo(repo);
        }
      } catch (error) {
        console.error('Failed to load active repo:', error);
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
  };
}

export default useRepo;
