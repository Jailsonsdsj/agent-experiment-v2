import type { Goal, EvaluationConcept } from '../types/index';

export const GOALS: Goal[] = [
  'Requirements',
  'Tests',
  'Implementation',
  'Design',
  'Process',
];

export const CONCEPT_LABELS: Record<EvaluationConcept | 'empty', string> = {
  MANA:  'Not Achieved',
  MPA:   'Partially Achieved',
  MA:    'Achieved',
  empty: 'Not Evaluated',
};
