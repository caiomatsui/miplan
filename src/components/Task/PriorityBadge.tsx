import { Badge } from '@/components/ui/Badge';
import { TaskPriority } from '@/types';

const priorityConfig = {
  high: { label: 'High', variant: 'destructive' as const },
  medium: { label: 'Med', variant: 'warning' as const },
  low: { label: 'Low', variant: 'success' as const },
  none: null,
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'default';
}

export function PriorityBadge({ priority, size = 'default' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  if (!config) return null;

  return (
    <Badge
      variant={config.variant}
      className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}
    >
      {config.label}
    </Badge>
  );
}
