import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-3.5 py-2.5 text-sm rounded-lg',
  lg: 'px-4 py-3 text-base rounded-xl',
};

export function Input({
  error = false,
  errorMessage,
  size = 'md',
  disabled = false,
  className = '',
  label,
  id,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-1.5',
            'transition-colors duration-150',
            isFocused ? 'text-primary' : 'text-foreground'
          )}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          // Base
          'w-full border bg-background text-foreground',
          'placeholder:text-muted-foreground',
          'transition-all duration-150',
          'shadow-sm',
          // Size
          sizeClasses[size],
          // States
          error
            ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20 animate-shake'
            : 'border-input hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20',
          // Disabled
          disabled && 'bg-muted text-muted-foreground cursor-not-allowed opacity-60',
          // Focus
          'focus:outline-none focus:ring-offset-0',
          className
        )}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1.5 text-sm text-destructive flex items-center gap-1 animate-fade-in">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
