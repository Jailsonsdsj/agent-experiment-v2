import { useState, useEffect, useCallback } from 'react';
import { getEvaluationSummary } from '../services/apiService';
import type { EvaluationSummaryRow } from '../types/index';

interface UseEvaluationSummaryResult {
  summary: EvaluationSummaryRow[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useEvaluationSummary = (): UseEvaluationSummaryResult => {
  const [summary, setSummary] = useState<EvaluationSummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getEvaluationSummary();
      setSummary(result);
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : 'Failed to load evaluations.');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, isLoading, error, reload };
};
