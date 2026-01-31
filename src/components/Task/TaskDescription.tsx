import { useState, useRef, useEffect, useCallback } from 'react';
import { linkifyText } from '../../utils/url';

export interface TaskDescriptionProps {
  description: string;
  onChange: (description: string) => void;
}

export function TaskDescription({ description, onChange }: TaskDescriptionProps) {
  const [value, setValue] = useState(description);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with external changes
  useEffect(() => {
    setValue(description);
  }, [description]);

  // Auto-resize textarea to fit content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content (with a minimum)
      textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
    }
  }, []);

  // Adjust height on mount and when value changes
  useEffect(() => {
    if (isEditing) {
      adjustHeight();
    }
  }, [value, adjustHeight, isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  // Display mode: show linkified text
  if (!isEditing) {
    return (
      <div
        onClick={handleStartEdit}
        className="w-full text-xs text-muted-foreground bg-muted/50 border border-border rounded-md p-2 min-h-[60px] cursor-text hover:border-ring/50 transition-colors whitespace-pre-wrap"
      >
        {value ? linkifyText(value) : <span className="text-muted-foreground/70">Add description...</span>}
      </div>
    );
  }

  // Edit mode: show textarea
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onClick={handleClick}
      onBlur={handleBlur}
      placeholder="Add description..."
      className="w-full text-xs text-muted-foreground bg-muted/50 border border-border rounded-md p-2 resize-none focus:outline-none focus:border-ring focus:bg-background transition-colors min-h-[60px]"
      rows={2}
    />
  );
}
