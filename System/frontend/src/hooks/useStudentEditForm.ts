import { useState, useCallback, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { getStudentById, updateStudent } from '../services/apiService';
import type { CreateInput, Student } from '../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

const CPF_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UseStudentEditFormReturn {
  fields: CreateInput<Student>;
  isLoading: boolean;
  isSubmitting: boolean;
  loadError: string | null;
  submitError: string | null;
  setField: (key: keyof CreateInput<Student>, value: string) => void;
  submit: () => Promise<boolean>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStudentEditForm = (id: string): UseStudentEditFormReturn => {
  const [fields, setFields] = useState<CreateInput<Student>>({
    name: '',
    cpf: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const student = await getStudentById(id);
        setFields({ name: student.name, cpf: student.cpf, email: student.email });
      } catch {
        setLoadError('Failed to load student. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const setField = useCallback(
    (key: keyof CreateInput<Student>, value: string): void => {
      setFields((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const submit = useCallback(async (): Promise<boolean> => {
    setSubmitError(null);

    if (!fields.name.trim()) {
      setSubmitError('Full name is required.');
      return false;
    }

    if (!CPF_PATTERN.test(fields.cpf)) {
      setSubmitError('CPF must be in the format 000.000.000-00');
      return false;
    }

    if (!EMAIL_PATTERN.test(fields.email)) {
      setSubmitError('Please enter a valid email address.');
      return false;
    }

    setIsSubmitting(true);

    try {
      await updateStudent(id, fields);
      return true;
    } catch (err) {
      if (isAxiosError<{ error?: string }>(err) && err.response) {
        setSubmitError(
          err.response.data.error ??
            'An unexpected error occurred. Please try again.',
        );
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [id, fields]);

  return { fields, isLoading, isSubmitting, loadError, submitError, setField, submit };
};
