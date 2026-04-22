import { useState, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { createClass } from '../services/apiService';
import type { Class, CreateInput } from '../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

const INITIAL_FIELDS: CreateInput<Class> = {
  topic: '',
  year: new Date().getFullYear(),
  semester: 1,
  studentIds: [],
};

export interface UseClassFormReturn {
  fields: CreateInput<Class>;
  isSubmitting: boolean;
  error: string | null;
  setField: (
    key: keyof Omit<CreateInput<Class>, 'studentIds'>,
    value: string,
  ) => void;
  toggleStudent: (studentId: string) => void;
  submit: () => Promise<boolean>;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useClassForm = (): UseClassFormReturn => {
  const [fields, setFields] = useState<CreateInput<Class>>(INITIAL_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(
    (
      key: keyof Omit<CreateInput<Class>, 'studentIds'>,
      value: string,
    ): void => {
      setFields((prev) => {
        if (key === 'semester') {
          const parsed = parseInt(value, 10);
          const semester: 1 | 2 = parsed === 2 ? 2 : 1;
          return { ...prev, semester };
        }
        if (key === 'year') {
          return {
            ...prev,
            year: parseInt(value, 10) || new Date().getFullYear(),
          };
        }
        return { ...prev, [key]: value };
      });
    },
    [],
  );

  const toggleStudent = useCallback((studentId: string): void => {
    setFields((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    setError(null);

    // ── Client-side validation ──────────────────────────────────────────────

    if (!fields.topic.trim()) {
      setError('Class topic is required.');
      return false;
    }

    if (fields.year < 2000 || fields.year > 2100) {
      setError('Please enter a valid year (2000–2100).');
      return false;
    }

    if (fields.semester !== 1 && fields.semester !== 2) {
      setError('Semester must be 1 or 2.');
      return false;
    }

    // ── API call ────────────────────────────────────────────────────────────

    setIsSubmitting(true);

    try {
      await createClass(fields);
      setError(null);
      return true;
    } catch (err) {
      if (isAxiosError<{ error?: string }>(err) && err.response) {
        setError(
          err.response.data.error ??
            'An unexpected error occurred. Please try again.',
        );
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

  return { fields, isSubmitting, error, setField, toggleStudent, submit, reset };
};
