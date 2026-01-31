import { useState, useEffect, useRef } from 'react';

interface ColumnHeaderProps {
  columnId: string;
  title: string;
  taskCount?: number;
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
  isEditing: externalIsEditing,
  onTitleChange,
  onEditComplete,
  dragHandleProps,
  menuSlot,
}: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(externalIsEditing ?? false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external editing state
  useEffect(() => {
    if (externalIsEditing !== undefined) {
      setIsEditing(externalIsEditing);
    }
  }, [externalIsEditing]);

  // Reset edit value when title changes externally
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // Focus input when entering edit mode
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

  return (
    <div
      className="flex items-center justify-between px-2 py-2"
      {...dragHandleProps}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-sm font-semibold text-foreground bg-background border border-ring rounded px-1 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Column title"
          />
        ) : (
          <h3
            onClick={handleStartEdit}
            className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary truncate"
            title={title}
          >
            {title}
          </h3>
        )}
        {taskCount !== undefined && !isEditing && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
            {taskCount}
          </span>
        )}
      </div>
      {menuSlot && <div className="flex-shrink-0 ml-1">{menuSlot}</div>}
    </div>
  );
}
