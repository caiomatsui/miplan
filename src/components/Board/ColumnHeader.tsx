import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getColumnHeaderStyles } from '../../constants/columnColors';
import type { ColumnColor } from '../../types';

interface ColumnHeaderProps {
  columnId: string;
  title: string;
  taskCount?: number;
  color?: ColumnColor;
  isEditing?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onEditComplete?: () => void;
  dragHandleProps?: Record<string, unknown>;
  menuSlot?: React.ReactNode;
}

export function ColumnHeader({
  columnId: _columnId,
  title,
  taskCount,
  color = 'slate',
  isEditing: externalIsEditing,
  onTitleChange,
  onEditComplete,
  dragHandleProps,
  menuSlot,
}: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(externalIsEditing ?? false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalIsEditing !== undefined) {
      setIsEditing(externalIsEditing);
    }
  }, [externalIsEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onTitleChange?.(trimmedValue);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
    onEditComplete?.();
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
    onEditComplete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const headerStyles = getColumnHeaderStyles(color);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        'px-3 py-2.5',
        'cursor-grab active:cursor-grabbing',
        'border-b border-border/30',
        'transition-colors duration-200'
      )}
      style={headerStyles}
      {...dragHandleProps}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Drag handle dots */}
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-40 transition-opacity">
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex-1 text-[13px] font-semibold text-foreground',
              'bg-card border border-primary/30 rounded-lg',
              'px-2.5 py-1.5',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
              'shadow-sm'
            )}
            aria-label="Column title"
          />
        ) : (
          <h3
            onClick={handleStartEdit}
            className={cn(
              'text-[13px] font-semibold text-foreground',
              'cursor-pointer truncate',
              'hover:text-primary transition-colors'
            )}
            title={title}
          >
            {title}
          </h3>
        )}

        {/* Task count badge */}
        {taskCount !== undefined && !isEditing && (
          <span
            className={cn(
              'inline-flex items-center justify-center',
              'min-w-[1.25rem] h-5 px-1.5',
              'text-[11px] font-medium tabular-nums',
              'bg-muted/80 text-muted-foreground',
              'rounded-full flex-shrink-0'
            )}
          >
            {taskCount}
          </span>
        )}
      </div>

      {/* Menu slot */}
      {menuSlot && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {menuSlot}
        </div>
      )}
    </div>
  );
}
