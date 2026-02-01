import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { useBoardActions } from '../../hooks/useBoard';
import { useColumnActions } from '../../hooks/useColumns';
import { useUIStore } from '../../store';
import { EXTENDED_BOARD_TEMPLATES, getTemplateById, type ExtendedBoardTemplate } from '../../constants/boardTemplates';
import type { Board, ColumnColor } from '../../types';
import { cn } from '@/lib/utils';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Template icon components
function TemplateIcon({ icon, className }: { icon: ExtendedBoardTemplate['icon']; className?: string }) {
  const iconProps = { className: cn('w-6 h-6', className), fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' };

  switch (icon) {
    case 'kanban':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      );
    case 'sprint':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'project':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'study':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'custom':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      );
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Board">
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
      <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
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
    </Modal>
  );
}
