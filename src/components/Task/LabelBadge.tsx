import { cn } from '@/lib/utils';
import { getContrastColor } from '@/constants/labelColors';

interface LabelBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'default';
  onClick?: (e: React.MouseEvent) => void;
}

export function LabelBadge({ name, color, size = 'default', onClick }: LabelBadgeProps) {
  const textColor = getContrastColor(color);

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-opacity',
        size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs',
        onClick && 'cursor-pointer hover:opacity-80'
      )}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {name}
    </span>
  );
}
