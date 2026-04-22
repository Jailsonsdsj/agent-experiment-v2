import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  action,
}: PageHeaderProps): JSX.Element => {
  return (
    <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="ml-4 shrink-0">{action}</div>
      )}
    </div>
  );
};
