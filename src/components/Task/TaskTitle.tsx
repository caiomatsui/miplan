import { useState, useRef, useEffect, useCallback } from 'react';
import { Task } from '../../types';
import { linkifyText } from '../../utils/url';

export interface TaskTitleProps {
  task: Task;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (title: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function TaskTitle({
  task,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: TaskTitleProps) {
  const [value, setValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(task.title);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update original value when task changes externally
  useEffect(() => {
    if (!isEditing) {
      setValue(task.title);
      originalValue.current = task.title;
    }
  }, [task.title, isEditing]);

  const handleSave = useCallback(() => {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      // Delete task if title is empty
      onDelete();
    } else if (trimmedValue !== originalValue.current) {
      // Only save if value changed
      onSave(trimmedValue);
      originalValue.current = trimmedValue;
    } else {
      // No change, just cancel edit mode
      onCancel();
    }
  }, [value, onSave, onCancel, onDelete]);

  const handleCancel = useCallback(() => {
    setValue(originalValue.current);
    onCancel();
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onStartEdit();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        className="w-full text-sm text-foreground font-medium bg-transparent border-b border-primary focus:outline-none focus:border-ring py-0.5"
        placeholder="Task title..."
      />
    );
  }

  return (
    <p
      onClick={handleClick}
      className="text-sm text-foreground font-medium leading-snug cursor-text hover:text-primary transition-colors"
    >
      {task.title ? linkifyText(task.title) : 'Untitled task'}
    </p>
  );
}
