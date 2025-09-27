import { useState, useCallback } from 'react';
import axios from 'axios';
import { ApiResponse, ContentData } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async (filename: string): Promise<ContentData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/content/${filename}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContent = useCallback(async (filename: string, data: ContentData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse>(`/content/${filename}`, data);

      if (response.data.status === 'success') {
        return true;
      } else {
        setError(response.data.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save content';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateHtml = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/generate');
      return response.data.status === 'success';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate HTML';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadContent,
    saveContent,
    generateHtml,
    clearError: () => setError(null),
  };
};