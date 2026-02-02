import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/Sheet';
import { Task } from '@/types';
import { useTaskActions } from '@/hooks/useTasks';
import { useColumns } from '@/hooks/useColumns';
import { useTaskLabels } from '@/hooks/useLabels';
import { debounce } from '@/utils/debounce';
import { PrioritySelector } from './PrioritySelector';
import { LabelPicker } from './LabelPicker';
import { LabelBadge } from './LabelBadge';
import { TaskTimer } from './TaskTimer';
import { ColumnSelector } from './ColumnSelector';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TaskDetailSheetProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailSheet({ task, onClose }: TaskDetailSheetProps) {
  const { updateTask, deleteTask, moveTask } = useTaskActions();
  const columns = useColumns(task?.boardId ?? null);
  const taskLabels = useTaskLabels(task?.id ?? null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task?.id, task?.title, task?.description]);

  // Auto-focus title input when sheet opens
  useEffect(() => {
    if (task && titleInputRef.current) {
      // Small delay to ensure sheet animation completes
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [task?.id]);

  // Debounced save for title
  const debouncedSaveTitle = useMemo(
    () =>
      debounce((value: string) => {
        if (task) updateTask(task.id, { title: value });
      }, 500),
    [task?.id, updateTask]
  );

  // Debounced save for description
  const debouncedSaveDescription = useMemo(
    () =>
      debounce((value: string) => {
        if (task) updateTask(task.id, { description: value });
      }, 500),
    [task?.id, updateTask]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSaveTitle.cancel();
      debouncedSaveDescription.cancel();
    };
  }, [debouncedSaveTitle, debouncedSaveDescription]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTitle(value);
      debouncedSaveTitle(value);
    },
    [debouncedSaveTitle]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setDescription(value);
      debouncedSaveDescription(value);
    },
    [debouncedSaveDescription]
  );

  const handlePriorityChange = useCallback(
    (priority: Task['priority']) => {
      if (task) updateTask(task.id, { priority });
    },
    [task?.id, updateTask]
  );

  const handleMove = useCallback(
    async (columnId: string) => {
      if (task && columnId !== task.columnId) {
        await moveTask(task.id, columnId, 0);
      }
    },
    [task, moveTask]
  );

  const handleDeleteClick = useCallback(() => {
    const skipConfirm = localStorage.getItem('miplan-skip-delete-confirm') === 'true';
    if (skipConfirm && task) {
      deleteTask(task.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  }, [task, deleteTask, onClose]);

  const handleConfirmDelete = useCallback(async (dontAskAgain?: boolean) => {
    if (task) {
      if (dontAskAgain) {
        localStorage.setItem('miplan-skip-delete-confirm', 'true');
      }
      await deleteTask(task.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  }, [task, deleteTask, onClose]);

  const selectedLabelIds = taskLabels?.map((l) => l.id) || [];

  if (!task) return null;

  return (
    <>
      <Sheet open={!!task} onClose={onClose}>
        <SheetHeader onClose={onClose}>
          <input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            className="w-full text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
            placeholder="Task title"
          />
        </SheetHeader>

        <SheetContent className="space-y-6">
          {/* Column Location */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Column</h3>
            <ColumnSelector
              columns={columns || []}
              value={task.columnId}
              onChange={handleMove}
            />
          </section>

          {/* Priority */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
            <PrioritySelector value={task.priority} onChange={handlePriorityChange} />
          </section>

          {/* Labels */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Labels</h3>
            <div className="flex flex-wrap items-center gap-2">
              <LabelPicker
                boardId={task.boardId}
                taskId={task.id}
                selectedLabelIds={selectedLabelIds}
              />
              {taskLabels && taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {taskLabels.map((label) => (
                    <LabelBadge key={label.id} name={label.name} color={label.color} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Timer */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Time Tracking</h3>
            <TaskTimer task={task} showResetButton />
          </section>

          {/* Description */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              className="w-full min-h-[150px] p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              style={{
                backgroundColor: 'var(--sheet-input-bg, rgba(255, 255, 255, 0.05))',
                border: '1px solid var(--sheet-border)',
                color: 'inherit',
              }}
              placeholder="Add a more detailed description..."
            />
          </section>
        </SheetContent>

        <SheetFooter>
          <button
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            Delete Task
          </button>
        </SheetFooter>
      </Sheet>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        showDontAskAgain
      />
    </>
  );
}
