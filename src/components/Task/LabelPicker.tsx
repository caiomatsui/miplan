import { useState, useRef, useEffect } from 'react';
import { Label } from '@/types';
import { useLabels, useLabelActions } from '@/hooks/useLabels';
import { LABEL_COLORS, getDefaultLabelColor, getContrastColor } from '@/constants/labelColors';
import { Tag, Check } from 'lucide-react';

interface LabelPickerProps {
  boardId: string;
  taskId: string;
  selectedLabelIds: string[];
  onClose?: () => void;
}

export function LabelPicker({ boardId, taskId, selectedLabelIds, onClose }: LabelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(getDefaultLabelColor());
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const labels = useLabels(boardId);
  const { toggleLabelOnTask, createLabel } = useLabelActions();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const filteredLabels = labels?.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (e: React.MouseEvent, labelId: string) => {
    e.stopPropagation();
    await toggleLabelOnTask(taskId, labelId);
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    await createLabel(boardId, newLabelName.trim(), selectedColor);
    setNewLabelName('');
    setIsCreating(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Tag className="w-4 h-4" />
        <span>Labels</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search labels..."
              className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Labels List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredLabels?.map((label) => (
              <LabelOption
                key={label.id}
                label={label}
                isSelected={selectedLabelIds.includes(label.id)}
                onToggle={handleToggle}
              />
            ))}

            {filteredLabels?.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No labels found</p>
            )}
          </div>

          {/* Create New Label */}
          <div className="border-t border-border p-2">
            {isCreating ? (
              <form onSubmit={handleCreateLabel} className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex flex-wrap gap-1">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(color.value);
                      }}
                      className={`w-5 h-5 rounded-full transition-all ${
                        selectedColor === color.value ? 'ring-2 ring-ring ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreating(false);
                    }}
                    className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreating(true);
                }}
                className="w-full text-left px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
              >
                + Create new label
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface LabelOptionProps {
  label: Label;
  isSelected: boolean;
  onToggle: (e: React.MouseEvent, labelId: string) => void;
}

function LabelOption({ label, isSelected, onToggle }: LabelOptionProps) {
  const textColor = getContrastColor(label.color);

  return (
    <button
      onClick={(e) => onToggle(e, label.id)}
      className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent text-left transition-colors"
    >
      <span
        className="flex-1 px-2 py-0.5 rounded text-xs font-medium"
        style={{
          backgroundColor: label.color,
          color: textColor,
        }}
      >
        {label.name}
      </span>
      {isSelected && (
        <Check className="w-4 h-4 text-primary" />
      )}
    </button>
  );
}
