import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}

export const Card = ({
  children,
  title,
  footer,
  className = '',
}: CardProps): JSX.Element => {
  return (
    <div className={`
      bg-white rounded-md shadow-card border border-neutral-200
      overflow-hidden ${className}
    `}>
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">
            {title}
          </h2>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-neutral-200
          bg-neutral-50">
          {footer}
        </div>
      )}
    </div>
  );
};
