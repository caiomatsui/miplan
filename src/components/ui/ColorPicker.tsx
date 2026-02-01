import { cn } from '@/lib/utils';
import { COLUMN_COLORS, type ColorDefinition } from '../../constants/columnColors';
import type { ColumnColor } from '../../types';

interface ColorPickerProps {
  /** Currently selected color key */
  value?: ColumnColor;
  /** Callback when a color is selected */
  onChange?: (color: ColumnColor) => void;
  /** Optional label text */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Custom colors to display (defaults to COLUMN_COLORS) */
  colors?: ColorDefinition[];
  /** Whether the picker is disabled */
  disabled?: boolean;
}

export function ColorPicker({
  value = 'slate',
  onChange,
  label,
  size = 'md',
  colors = COLUMN_COLORS,
  disabled = false,
}: ColorPickerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  };

  const handleColorClick = (colorKey: ColumnColor) => {
    if (!disabled) {
      onChange?.(colorKey);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', disabled && 'opacity-50 pointer-events-none')}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {colors.map((color) => (
          <button
            key={color.key}
            type="button"
            onClick={() => handleColorClick(color.key)}
            className={cn(
              sizeClasses[size],
              'rounded-full transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'hover:scale-110',
              value === color.key && 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110'
            )}
            style={{
              backgroundColor: `oklch(var(--accent-${color.key}))`,
            }}
            title={color.name}
            aria-label={`Select ${color.name} color`}
            aria-pressed={value === color.key}
          />
        ))}
      </div>
    </div>
  );
}

interface ColorDotProps {
  /** Color key */
  color: ColumnColor;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Optional className */
  className?: string;
}

/**
 * Simple color dot indicator
 */
export function ColorDot({ color, size = 'sm', className }: ColorDotProps) {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        sizeClasses[size],
        'rounded-full inline-block flex-shrink-0',
        className
      )}
      style={{
        backgroundColor: `oklch(var(--accent-${color}))`,
      }}
    />
  );
}
