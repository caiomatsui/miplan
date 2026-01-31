import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useTaskActions } from '../../hooks/useTasks';

interface TaskActionsProps {
  taskId: string;
}

export function TaskActions({ taskId }: TaskActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { deleteTask } = useTaskActions();

  const handleDelete = async () => {
    await deleteTask(taskId);
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Delete task"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}
