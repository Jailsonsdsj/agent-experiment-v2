import React from 'react';

export interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
  required = false,
}: SelectProps): JSX.Element => {
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

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={[
            'appearance-none block w-full rounded-md border px-3 py-2 pr-10',
            'text-base text-neutral-800 bg-white',
            'focus:outline-none focus:shadow-focus transition-colors duration-150',
            error
              ? 'border-functional-danger focus:border-functional-danger'
              : 'border-neutral-300 focus:border-primary-500',
            disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-functional-danger">
          {error}
        </p>
      )}
    </div>
  );
};
