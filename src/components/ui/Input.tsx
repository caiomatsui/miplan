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
  const baseClasses = 'w-full border bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200';

  const stateClasses = error
    ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive focus:ring-offset-0'
    : 'border-input focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-0';

  const disabledClasses = disabled
    ? 'bg-muted text-muted-foreground cursor-not-allowed'
    : '';

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
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
        <p className="mt-1 text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
