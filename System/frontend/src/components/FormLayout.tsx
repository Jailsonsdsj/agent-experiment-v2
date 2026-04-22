import React from 'react';

export interface FormLayoutProps {
  children: React.ReactNode;
  onSubmit: () => void;
  title?: string;
}

export const FormLayout = ({
  children,
  onSubmit,
  title,
}: FormLayoutProps): JSX.Element => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      onSubmit();
    }
  };

  return (
    <div role="form" onKeyDown={handleKeyDown}>
      {title && (
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">{title}</h3>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
};
