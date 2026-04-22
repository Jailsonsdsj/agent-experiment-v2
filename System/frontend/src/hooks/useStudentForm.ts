import { useState, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { createStudent } from '../services/apiService';
import type { CreateInput, Student } from '../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

const INITIAL_FIELDS: CreateInput<Student> = {
  name: '',
  cpf: '',
  email: '',
};

const CPF_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseStudentFormReturn {
  fields: CreateInput<Student>;
  isSubmitting: boolean;
  error: string | null;
  setField: (key: keyof CreateInput<Student>, value: string) => void;
  submit: () => Promise<boolean>;
  reset: () => void;
}

export const useStudentForm = (): UseStudentFormReturn => {
  const [fields, setFields] = useState<CreateInput<Student>>(INITIAL_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(
    (key: keyof CreateInput<Student>, value: string): void => {
      setFields((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /**
   * Runs client-side validation, calls the API, and returns whether the
   * operation succeeded. Returns true on success, false on any failure.
   * Navigation is the caller's responsibility.
   */
  const submit = useCallback(async (): Promise<boolean> => {
    setError(null);

    // ── Client-side validation ──────────────────────────────────────────────

    if (!fields.name.trim()) {
      setError('Full name is required.');
      return false;
    }

    if (!CPF_PATTERN.test(fields.cpf)) {
      setError('CPF must be in the format 000.000.000-00');
      return false;
    }

    if (!EMAIL_PATTERN.test(fields.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // ── API call ────────────────────────────────────────────────────────────

    setIsSubmitting(true);

    try {
      await createStudent(fields);
      setError(null);
      return true;
    } catch (err) {
      if (isAxiosError<{ error?: string }>(err)) {
        if (err.response) {
          // Server responded — extract the domain error message.
          setError(
            err.response.data.error ??
              'An unexpected error occurred. Please try again.',
          );
        } else {
          // No response — network failure.
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fields]);

  const reset = useCallback((): void => {
    setFields(INITIAL_FIELDS);
    setError(null);
  }, []);

  return { fields, isSubmitting, error, setField, submit, reset };
};
