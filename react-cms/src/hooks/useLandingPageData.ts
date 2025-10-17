import { useState, useCallback } from 'react';

/**
 * Landing Page Data Hook
 *
 * Loads and saves landing page content from /public/data/ folder
 * This is different from useApi which loads from GitHub repos
 */
export const useLandingPageData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load content from public/data folder
   */
  const loadContent = useCallback(async (filename: string): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/data/${filename}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load ${filename}.json`);
      }

      const data = await response.json();
      console.log(`✅ Loaded landing page data: ${filename}`, data);

      return data;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load content';
      console.error('Load landing page content error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save content - for now, just log a warning
   * TODO: Implement actual save to GitHub or local storage
   */
  const saveContent = useCallback(async (
    filename: string,
    data: any
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`💾 Saving ${filename}:`, data);

      // For now, we'll just simulate a save
      // In a real implementation, this would:
      // 1. Save to localStorage for immediate preview
      // 2. Commit to GitHub repo (almostacms/almostacms.com)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save to localStorage for now
      localStorage.setItem(`landing_${filename}`, JSON.stringify(data));

      console.log(`✅ Saved ${filename} to localStorage`);

      return true;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save content';
      console.error('Save landing page content error:', err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
    clearError,
  };
};

export default useLandingPageData;
