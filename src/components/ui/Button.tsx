import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md',
  secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm',
  danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm hover:shadow-md',
  ghost: 'bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground',
  outline: 'bg-transparent border border-border hover:bg-accent hover:border-primary/30 text-foreground',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-base rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Micro-interaction: press feedback
        'active:scale-[0.97] active:transition-transform active:duration-75',
        // Variant and size
        variantClasses[variant],
        sizeClasses[size],
        // Disabled/loading state
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        !isDisabled && 'cursor-pointer',
        // Loading pulse
        isLoading && 'animate-pulse',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
