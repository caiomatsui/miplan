import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Label } from '@/types';
import { useLabels, useLabelActions } from '@/hooks/useLabels';
import { LABEL_COLORS, getDefaultLabelColor, getContrastColor } from '@/constants/labelColors';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Labels">
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
      </Modal>

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
        <div className="flex flex-wrap gap-1">
          {LABEL_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-6 h-6 rounded-full transition-all ${
                color === c.value ? 'ring-2 ring-ring ring-offset-1' : ''
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
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
        <button
          onClick={onEdit}
          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
          title="Edit label"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
          title="Delete label"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
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
      <div className="flex flex-wrap gap-1">
        {LABEL_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setColor(c.value)}
            className={`w-6 h-6 rounded-full transition-all ${
              color === c.value ? 'ring-2 ring-ring ring-offset-1' : ''
            }`}
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
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
