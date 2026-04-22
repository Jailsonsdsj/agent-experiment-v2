import React from 'react';
import type { EvaluationConcept } from '../types/index';

export interface BadgeProps {
  concept: EvaluationConcept | 'empty';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

interface ConceptStyle {
  wrapper: string;
  dot: string;
  label: string;
}

const conceptStyles: Record<EvaluationConcept | 'empty', ConceptStyle> = {
  MANA: {
    wrapper:
      'bg-concept-mana-bg text-concept-mana-text border border-concept-mana-border',
    dot: 'bg-concept-mana-text',
    label: 'Not Achieved',
  },
  MPA: {
    wrapper:
      'bg-concept-mpa-bg text-concept-mpa-text border border-concept-mpa-border',
    dot: 'bg-concept-mpa-text',
    label: 'Partially Achieved',
  },
  MA: {
    wrapper:
      'bg-concept-ma-bg text-concept-ma-text border border-concept-ma-border',
    dot: 'bg-concept-ma-text',
    label: 'Achieved',
  },
  empty: {
    wrapper:
      'bg-concept-empty-bg text-concept-empty-text border border-concept-empty-border',
    dot: 'bg-concept-empty-text',
    label: 'Not Evaluated',
  },
};

const labelSizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
};

const dotSizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
};

export const Badge = ({
  concept,
  size = 'md',
  showLabel = true,
}: BadgeProps): JSX.Element => {
  const styles = conceptStyles[concept];

  if (!showLabel) {
    return (
      <span
        className={[
          'inline-block rounded-full',
          dotSizeClasses[size],
          styles.dot,
        ].join(' ')}
        aria-label={styles.label}
        title={styles.label}
      />
    );
  }

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium',
        labelSizeClasses[size],
        styles.wrapper,
      ].join(' ')}
    >
      {styles.label}
    </span>
  );
};
