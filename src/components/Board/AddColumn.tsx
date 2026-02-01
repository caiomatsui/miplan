import { useState, useRef, useEffect, useCallback } from 'react';
import { useColumnActions } from '../../hooks/useColumns';
import { useUIStore } from '../../store';
import { ColorPicker } from '../ui/ColorPicker';
import { Button } from '../ui/Button';
import { COLUMN_COLORS, DEFAULT_COLUMN_COLOR } from '../../constants/columnColors';
import type { ColumnColor } from '../../types';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface AddColumnProps {
  onColumnCreated?: (columnId: string) => void;
}

export function AddColumn({ onColumnCreated }: AddColumnProps) {
  const activeBoardId = useUIStore((state) => state.activeBoardId);
  const { createColumn } = useColumnActions();

  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColumnColor>(DEFAULT_COLUMN_COLOR);
  const [isCreating, setIsCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleCreate = useCallback(async () => {
    if (!activeBoardId || !name.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newColumnId = await createColumn(activeBoardId, name.trim(), color);
      onColumnCreated?.(newColumnId);
      setName('');
      setColor(DEFAULT_COLUMN_COLOR);
      setIsExpanded(false);
    } finally {
      setIsCreating(false);
    }
  }, [activeBoardId, name, color, isCreating, createColumn, onColumnCreated]);

  const handleCancel = useCallback(() => {
    setName('');
    setColor(DEFAULT_COLUMN_COLOR);
    setIsExpanded(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [name, handleCreate, handleCancel]);

  if (isExpanded) {
    return (
      <div className={cn(
        'w-[280px] flex-shrink-0',
        'p-4 rounded-xl',
        'bg-surface-sunken/70 backdrop-blur-sm',
        'border border-white/30 dark:border-white/10',
        'shadow-sm'
      )}>
        {/* Column Name Input */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Column name..."
          disabled={isCreating}
          className={cn(
            'w-full px-3 py-2 text-sm',
            'bg-card border border-border/60 rounded-lg',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30',
            'transition-colors duration-150',
            isCreating && 'opacity-50'
          )}
        />

        {/* Color Picker */}
        <div className="mt-3">
          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            size="sm"
            colors={COLUMN_COLORS}
            disabled={isCreating}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? 'Adding...' : 'Add Column'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      className={cn(
        'w-[280px] h-[120px] flex-shrink-0',
        'flex flex-col items-center justify-center gap-2',
        'rounded-xl border-2 border-dashed border-border/40',
        'text-muted-foreground',
        'bg-transparent',
        'hover:border-primary/40 hover:bg-primary/5',
        'hover:text-primary',
        'transition-all duration-200',
        'group'
      )}
      onClick={() => setIsExpanded(true)}
    >
      <Plus className="w-6 h-6 transition-transform group-hover:scale-110" />
      <span className="text-sm font-medium">Add Column</span>
    </button>
  );
}
