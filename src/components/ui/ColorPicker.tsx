import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { COLUMN_COLORS, type ColorDefinition } from '../../constants/columnColors';
import type { ColumnColor } from '../../types';
import { Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  /** Show selected color name below picker (only for inline mode) */
  showSelectedName?: boolean;
  /** Display mode: 'popover' for trigger+popover, 'inline' for grid display */
  mode?: 'popover' | 'inline';
  /** Custom className for the trigger button (popover mode) */
  className?: string;
}

/**
 * Helper to determine if a color is light (for checkmark contrast)
 */
function isLightColor(colorKey: ColumnColor): boolean {
  // Light colors that need dark checkmarks
  const lightColors = ['amber', 'green', 'teal'];
  return lightColors.includes(colorKey);
}

export function ColorPicker({
  value = 'slate',
  onChange,
  label,
  size = 'md',
  colors = COLUMN_COLORS,
  disabled = false,
  showSelectedName = true,
  mode = 'inline',
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeStyles = {
    sm: { width: '32px', height: '32px' },
    md: { width: '40px', height: '40px' },
  };

  const handleColorClick = (colorKey: ColumnColor) => {
    if (!disabled) {
      onChange?.(colorKey);
      if (mode === 'popover') {
        setOpen(false);
      }
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = focusedIndex >= 0 ? focusedIndex : colors.findIndex(c => c.key === value);
    let newIndex = currentIndex;
    const cols = 4; // 4 columns in the grid

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % colors.length;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + colors.length) % colors.length;
        break;
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + cols, colors.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - cols, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleColorClick(colors[focusedIndex].key);
        }
        return;
      case 'Escape':
        if (mode === 'popover') {
          e.preventDefault();
          setOpen(false);
        }
        return;
      default:
        return;
    }

    e.preventDefault();
    setFocusedIndex(newIndex);
    const buttons = containerRef.current?.querySelectorAll('button[role="option"]');
    (buttons?.[newIndex] as HTMLButtonElement)?.focus();
  }, [focusedIndex, colors, value, mode]);

  const selectedColor = colors.find(c => c.key === value);

  // Color grid component shared between modes
  const ColorGrid = (
    <div
      ref={containerRef}
      className="grid grid-cols-4 gap-3"
      role="listbox"
      aria-label="Color selection"
      onKeyDown={handleKeyDown}
    >
      {colors.map((color, index) => {
        const isSelected = value === color.key;
        return (
          <Tooltip key={color.key}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleColorClick(color.key)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                className={cn(
                  'rounded-full transition-all duration-150 relative',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'hover:scale-110 hover:shadow-md',
                  isSelected && 'ring-[3px] ring-ring ring-offset-2 ring-offset-background scale-110 shadow-md'
                )}
                style={{
                  ...sizeStyles[size],
                  backgroundColor: `oklch(var(--accent-${color.key}))`,
                }}
                aria-label={`Select ${color.name} color${isSelected ? ' (selected)' : ''}`}
              >
                {/* Checkmark for selected state */}
                {isSelected && (
                  <Check
                    className={cn(
                      'absolute inset-0 m-auto h-5 w-5 drop-shadow-sm',
                      isLightColor(color.key) ? 'text-gray-800' : 'text-white'
                    )}
                    strokeWidth={3}
                  />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {color.name}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );

  // Popover mode: trigger button + popover content
  if (mode === 'popover') {
    return (
      <div className={cn('flex flex-col gap-2', disabled && 'opacity-50 pointer-events-none')}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'h-10 w-10 rounded-full border-2 border-border',
                'hover:border-primary/50 transition-all duration-150',
                'hover:scale-105 hover:shadow-md',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                disabled && 'cursor-not-allowed',
                className
              )}
              style={{ backgroundColor: `oklch(var(--accent-${value}))` }}
              aria-label={`Selected color: ${selectedColor?.name || 'Select color'}`}
            >
              <span className="sr-only">
                {selectedColor?.name || 'Select color'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            {ColorGrid}
          </PopoverContent>
        </Popover>
        {/* Selected color name */}
        {showSelectedName && selectedColor && (
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selectedColor.name}</span>
          </p>
        )}
      </div>
    );
  }

  // Inline mode: grid display directly
  return (
    <div className={cn('flex flex-col gap-3', disabled && 'opacity-50 pointer-events-none')}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {ColorGrid}
      {/* Selected color name */}
      {showSelectedName && selectedColor && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selectedColor.name}</span>
        </p>
      )}
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
  const sizeStyles = {
    xs: { width: '8px', height: '8px' },
    sm: { width: '12px', height: '12px' },
    md: { width: '16px', height: '16px' },
  };

  return (
    <span
      className={cn(
        'rounded-full inline-block flex-shrink-0',
        className
      )}
      style={{
        ...sizeStyles[size],
        backgroundColor: `oklch(var(--accent-${color}))`,
      }}
    />
  );
}
