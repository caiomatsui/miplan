import { TaskPriority } from '@/types';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: {
    label: 'High',
    icon: '!',
    dotClass: 'bg-priority-critical',
    bgClass: 'bg-priority-critical-bg',
    textClass: 'text-priority-critical',
    borderClass: 'priority-border-critical',
  },
  medium: {
    label: 'Med',
    icon: '−',
    dotClass: 'bg-priority-medium',
    bgClass: 'bg-priority-medium-bg',
    textClass: 'text-priority-medium',
    borderClass: 'priority-border-medium',
  },
  low: {
    label: 'Low',
    icon: '↓',
    dotClass: 'bg-priority-low',
    bgClass: 'bg-priority-low-bg',
    textClass: 'text-priority-low',
    borderClass: 'priority-border-low',
  },
  none: null,
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'default';
  showLabel?: boolean;
}

export function PriorityBadge({ priority, size = 'default', showLabel = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  if (!config) return null;

  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md ring-1 ring-inset transition-colors',
        config.bgClass,
        config.textClass,
        isSmall
          ? 'text-[10px] px-1.5 py-0.5 ring-current/20'
          : 'text-xs px-2 py-0.5 ring-current/20'
      )}
    >
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          config.dotClass,
          isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'
        )}
      />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// Helper to get the border class for task cards
export function getPriorityBorderClass(priority: TaskPriority): string {
  const config = priorityConfig[priority];
  return config?.borderClass || '';
}
