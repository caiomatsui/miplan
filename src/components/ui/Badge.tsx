import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary ring-primary/20',
        secondary: 'bg-secondary text-secondary-foreground ring-border/50',
        destructive: 'bg-destructive/10 text-destructive ring-destructive/20',
        warning: 'bg-warning/10 text-warning-foreground ring-warning/30',
        success: 'bg-success/10 text-success ring-success/20',
        info: 'bg-info/10 text-info ring-info/20',
        outline: 'bg-transparent text-foreground ring-border',
        // Priority variants
        critical: 'bg-priority-critical-bg text-priority-critical ring-priority-critical/20',
        high: 'bg-priority-high-bg text-priority-high ring-priority-high/20',
        medium: 'bg-priority-medium-bg text-priority-medium ring-priority-medium/20',
        low: 'bg-priority-low-bg text-priority-low ring-priority-low/20',
        // Status variants
        todo: 'bg-muted text-status-todo ring-status-todo/20',
        progress: 'bg-warning/10 text-status-progress ring-status-progress/20',
        done: 'bg-success/10 text-status-done ring-status-done/20',
        blocked: 'bg-destructive/10 text-status-blocked ring-status-blocked/20',
      },
      size: {
        default: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-0 text-[10px]',
        lg: 'px-2.5 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { badgeVariants };
