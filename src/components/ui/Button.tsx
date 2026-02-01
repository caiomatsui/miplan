import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// CVA-based buttonVariants for shadcn compatibility
export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] active:transition-transform active:duration-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md',
        primary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md',
        secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm',
        destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm hover:shadow-md',
        danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm hover:shadow-md',
        ghost: 'bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground',
        outline: 'bg-transparent border border-border hover:bg-accent hover:border-primary/30 text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-4 py-2 text-sm rounded-lg gap-2',
        sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
        md: 'px-4 py-2 text-sm rounded-lg gap-2',
        lg: 'px-6 py-2.5 text-base rounded-xl gap-2',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  children: React.ReactNode;
}

// Legacy variant classes (kept for backwards compatibility)
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
  const resolvedVariant = variant || 'primary';
  const resolvedSize = size || 'md';

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
        variantClasses[resolvedVariant] || variantClasses.primary,
        sizeClasses[resolvedSize] || sizeClasses.md,
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
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </button>
  );
}
