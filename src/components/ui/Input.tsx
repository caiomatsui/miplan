import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-sm rounded',
  md: 'px-3 py-2 text-base rounded-md',
  lg: 'px-4 py-3 text-lg rounded-lg',
};

export function Input({
  error = false,
  errorMessage,
  size = 'md',
  disabled = false,
  className = '',
  label,
  id,
  ...props
}: InputProps) {
  const baseClasses = 'w-full border bg-white text-gray-900 placeholder-gray-400 transition-colors duration-200';

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0'
    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0';

  const disabledClasses = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
    : '';

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${className} focus:outline-none`}
        disabled={disabled}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
