import { useState, useCallback, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { getStudents, deleteStudent } from '../services/apiService';
import type { Student } from '../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseStudentsReturn {
  students: Student[];
  isLoading: boolean;
  isDeleting: boolean;
  fetchError: string | null;
  deleteError: string | null;
  reload: () => Promise<void>;
  removeStudent: (id: string) => Promise<boolean>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStudents = (): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /**
   * Fetches the full student list from GET /students.
   * Sets isLoading while the request is in flight.
   * Sets fetchError on failure; clears it on success.
   */
  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setFetchError('Failed to load students. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deletes a student by id, then re-fetches the list on success.
   * Returns true on success, false on any failure.
   * Sets deleteError on failure so the modal can surface it.
   * Never removes the student from local state optimistically —
   * the backend is the source of truth.
   *
   * @param id - UUID of the student to delete.
   */
  const removeStudent = useCallback(
    async (id: string): Promise<boolean> => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        await deleteStudent(id);
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
    students,
    isLoading,
    isDeleting,
    fetchError,
    deleteError,
    reload,
    removeStudent,
  };
};
