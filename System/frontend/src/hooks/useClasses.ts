import { useState, useCallback, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { getClasses, deleteClass } from '../services/apiService';
import type { Class } from '../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseClassesReturn {
  classes: Class[];
  isLoading: boolean;
  isDeleting: boolean;
  fetchError: string | null;
  deleteError: string | null;
  reload: () => Promise<void>;
  removeClass: (id: string) => Promise<boolean>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useClasses = (): UseClassesReturn => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      setFetchError('Failed to load classes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeClass = useCallback(
    async (id: string): Promise<boolean> => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        await deleteClass(id);
        await reload();
        return true;
      } catch (err) {
        if (isAxiosError<{ error?: string }>(err) && err.response) {
          setDeleteError(
            err.response.data.error ??
              'An unexpected error occurred. Please try again.',
          );
        } else {
          setDeleteError('An unexpected error occurred. Please try again.');
        }
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    classes,
    isLoading,
    isDeleting,
    fetchError,
    deleteError,
    reload,
    removeClass,
  };
};
