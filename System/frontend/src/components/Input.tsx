import React from 'react';

export interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'number' | 'password';
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
  required = false,
}: InputProps): JSX.Element => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-neutral-700">
        {label}
        {required && (
          <span className="ml-0.5 text-functional-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={[
          'block w-full rounded-md border px-3 py-2 text-base text-neutral-800',
          'placeholder:text-neutral-400 bg-white',
          'focus:outline-none focus:shadow-focus transition-colors duration-150',
          error
            ? 'border-functional-danger focus:border-functional-danger'
            : 'border-neutral-300 focus:border-primary-500',
          disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : '',
        ].join(' ')}
      />

      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-functional-danger">
          {error}
        </p>
      )}
    </div>
  );
};
