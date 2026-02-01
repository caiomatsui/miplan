import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/types';
import { useLabels, useLabelActions } from '@/hooks/useLabels';
import { LABEL_COLORS, getDefaultLabelColor, getContrastColor } from '@/constants/labelColors';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pencil, Trash2, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LabelManagerProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LabelManager({ boardId, isOpen, onClose }: LabelManagerProps) {
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const labels = useLabels(boardId);
  const { deleteLabel } = useLabelActions();

  const handleDelete = async () => {
    if (deletingLabel) {
      await deleteLabel(deletingLabel.id);
      setDeletingLabel(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle>Manage Labels</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Labels List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {labels?.map((label) => (
                <LabelRow
                  key={label.id}
                  label={label}
                  isEditing={editingLabel?.id === label.id}
                  onEdit={() => setEditingLabel(label)}
                  onCancelEdit={() => setEditingLabel(null)}
                  onDelete={() => setDeletingLabel(label)}
                />
              ))}

              {labels?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No labels yet. Create your first label below.
                </p>
              )}
            </div>

            {/* Create New Label */}
            {isCreating ? (
              <CreateLabelForm
                boardId={boardId}
                onComplete={() => setIsCreating(false)}
                onCancel={() => setIsCreating(false)}
              />
            ) : (
              <Button
                variant="secondary"
                onClick={() => setIsCreating(true)}
                className="w-full"
              >
                + Create New Label
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingLabel}
        title="Delete Label"
        message={`Are you sure you want to delete "${deletingLabel?.name}"? It will be removed from all tasks.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingLabel(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}

interface LabelRowProps {
  label: Label;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function LabelRow({ label, isEditing, onEdit, onCancelEdit, onDelete }: LabelRowProps) {
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateLabel } = useLabelActions();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setName(label.name);
    setColor(label.color);
  }, [label]);

  const handleSave = async () => {
    if (name.trim()) {
      await updateLabel(label.id, { name: name.trim(), color });
    }
    onCancelEdit();
  };

  const textColor = getContrastColor(isEditing ? color : label.color);

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="grid grid-cols-7 gap-2" role="listbox" aria-label="Label color selection">
          {LABEL_COLORS.map((c) => {
            const isSelected = color === c.value;
            return (
              <Tooltip key={c.name}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'w-10 h-10 rounded-full transition-all duration-150 relative',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'hover:scale-110 hover:shadow-md',
                      isSelected && 'ring-[3px] ring-ring ring-offset-2 ring-offset-background scale-110 shadow-md'
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={`Select ${c.name} color${isSelected ? ' (selected)' : ''}`}
                  >
                    {isSelected && (
                      <Check
                        className={cn(
                          'absolute inset-0 m-auto h-5 w-5 drop-shadow-sm',
                          getContrastColor(c.value) === 'white' ? 'text-white' : 'text-gray-800'
                        )}
                        strokeWidth={3}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {c.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group">
      <span
        className="flex-1 px-3 py-1 rounded text-sm font-medium"
        style={{
          backgroundColor: label.color,
          color: textColor,
        }}
      >
        {label.name}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onEdit}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
              aria-label="Edit label"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Edit label
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
              aria-label="Delete label"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Delete label
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

interface CreateLabelFormProps {
  boardId: string;
  onComplete: () => void;
  onCancel: () => void;
}

function CreateLabelForm({ boardId, onComplete, onCancel }: CreateLabelFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(getDefaultLabelColor());
  const inputRef = useRef<HTMLInputElement>(null);

  const { createLabel } = useLabelActions();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createLabel(boardId, name.trim(), color);
    setName('');
    setColor(getDefaultLabelColor());
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-muted/50 rounded-lg space-y-2">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Label name"
        className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="grid grid-cols-7 gap-2" role="listbox" aria-label="Label color selection">
        {LABEL_COLORS.map((c) => {
          const isSelected = color === c.value;
          return (
            <Tooltip key={c.name}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all duration-150 relative',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'hover:scale-110 hover:shadow-md',
                    isSelected && 'ring-[3px] ring-ring ring-offset-2 ring-offset-background scale-110 shadow-md'
                  )}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Select ${c.name} color${isSelected ? ' (selected)' : ''}`}
                >
                  {isSelected && (
                    <Check
                      className={cn(
                        'absolute inset-0 m-auto h-5 w-5 drop-shadow-sm',
                        getContrastColor(c.value) === 'white' ? 'text-white' : 'text-gray-800'
                      )}
                      strokeWidth={3}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {c.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!name.trim()}>
          Create
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
