import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { useBoardActions } from '../../hooks/useBoard';
import { useColumnActions } from '../../hooks/useColumns';
import { useUIStore } from '../../store';
import { EXTENDED_BOARD_TEMPLATES, getTemplateById, type ExtendedBoardTemplate } from '../../constants/boardTemplates';
import type { Board, ColumnColor } from '../../types';
import { cn } from '@/lib/utils';
import { Columns3, Zap, ClipboardCheck, BookOpen, Plus } from 'lucide-react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Template icon components
function TemplateIcon({ icon, className }: { icon: ExtendedBoardTemplate['icon']; className?: string }) {
  const iconClass = cn('w-6 h-6', className);

  switch (icon) {
    case 'kanban':
      return <Columns3 className={iconClass} strokeWidth={1.5} />;
    case 'sprint':
      return <Zap className={iconClass} strokeWidth={1.5} />;
    case 'project':
      return <ClipboardCheck className={iconClass} strokeWidth={1.5} />;
    case 'study':
      return <BookOpen className={iconClass} strokeWidth={1.5} />;
    case 'custom':
      return <Plus className={iconClass} strokeWidth={1.5} />;
  }
}

// Template card component
function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: ExtendedBoardTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        'p-4 rounded-xl border-2 transition-all duration-150',
        'text-center',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border/60 hover:border-primary/40 hover:bg-accent/50'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          'transition-colors duration-150'
        )}
        style={{
          backgroundColor: `oklch(var(--accent-${template.color}) / 0.15)`,
          color: `oklch(var(--accent-${template.color}))`,
        }}
      >
        <TemplateIcon icon={template.icon} />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{template.name}</p>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </div>
    </button>
  );
}

// Column preview component
function ColumnPreview({ columns, color }: { columns: string[]; color: ColumnColor }) {
  if (columns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4 text-center">
        No columns - you'll add them after creating the board
      </p>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {columns.map((col, i) => (
        <div
          key={i}
          className={cn(
            'flex-shrink-0 px-3 py-2 rounded-lg',
            'text-xs font-medium',
            'border border-border/40'
          )}
          style={{
            borderLeftWidth: '3px',
            borderLeftColor: `oklch(var(--accent-${color}))`,
            backgroundColor: `oklch(var(--accent-${color}) / 0.05)`,
          }}
        >
          {col}
        </div>
      ))}
    </div>
  );
}

export function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('kanban');
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColumnColor>('blue');
  const [columns, setColumns] = useState<string[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const { createBoard } = useBoardActions();
  const { createColumn } = useColumnActions();
  const setActiveBoard = useUIStore((state) => state.setActiveBoard);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedTemplateId('kanban');
      setName('');
      setColor('blue');
      setColumns([]);
      setError('');
    }
  }, [isOpen]);

  // Update columns and color when template changes
  useEffect(() => {
    const template = getTemplateById(selectedTemplateId);
    if (template) {
      setColumns([...template.columns]);
      setColor(template.color);
    }
  }, [selectedTemplateId]);

  const selectedTemplate = getTemplateById(selectedTemplateId);

  const handleNext = useCallback(() => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) {
        setError('Board name is required');
        return;
      }
      setError('');
      setStep(3);
    }
  }, [step, name]);

  const handleBack = useCallback(() => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    setError('');
  }, [step]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError('Board name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Determine board type
      const boardType: Board['type'] = selectedTemplate?.type || 'kanban';

      // Create the board
      const boardId = await createBoard(name.trim(), boardType);

      // Create columns with colors
      for (const columnTitle of columns) {
        await createColumn(boardId, columnTitle, color);
      }

      // Set as active board
      setActiveBoard(boardId);

      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  }, [name, selectedTemplate, columns, color, createBoard, createColumn, setActiveBoard, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      e.preventDefault();
      if (step < 3) {
        handleNext();
      } else {
        handleCreate();
      }
    }
  }, [step, isCreating, handleNext, handleCreate]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px]">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                    s === step
                      ? 'bg-primary text-primary-foreground'
                      : s < step
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 transition-colors',
                      s < step ? 'bg-primary/40' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Choose a template to get started</p>
              <div className="grid grid-cols-2 gap-3">
                {EXTENDED_BOARD_TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplateId === template.id}
                    onSelect={() => setSelectedTemplateId(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Board Name & Color */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Board Name"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="My Board"
                error={!!error}
                errorMessage={error}
                disabled={isCreating}
              />

              <ColorPicker
                label="Board Color"
                value={color}
                onChange={setColor}
                size="md"
              />
            </div>
          )}

          {/* Step 3: Preview Columns */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate?.name} template with {columns.length} columns
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Columns Preview</p>
                <ColumnPreview columns={columns} color={color} />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-border/50">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack} disabled={isCreating}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Board'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
