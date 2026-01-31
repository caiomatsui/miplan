import { useState, useRef, useEffect } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ColumnMenuProps {
  columnId: string;
  hasMultipleColumns: boolean;
  hasTasks: boolean;
  onDelete: (moveTasksTo?: string) => void;
  getPreviousColumnId: () => string | null;
}

export function ColumnMenu({
  columnId: _columnId,
  hasMultipleColumns,
  hasTasks,
  onDelete,
  getPreviousColumnId,
}: ColumnMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDeleteClick = () => {
    setIsOpen(false);
    if (!hasMultipleColumns) {
      // Show error - can't delete last column
      return;
    }
    if (hasTasks) {
      // Show move options modal
      setShowMoveOptions(true);
    } else {
      // No tasks, show simple confirm
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteWithTasks = () => {
    setShowMoveOptions(false);
    onDelete();
  };

  const handleMoveAndDelete = () => {
    setShowMoveOptions(false);
    const previousColumnId = getPreviousColumnId();
    onDelete(previousColumnId ?? undefined);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Column menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="6" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="18" r="2" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-popover rounded-md shadow-lg border border-border py-1 z-50">
          <button
            onClick={handleDeleteClick}
            disabled={!hasMultipleColumns}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
              hasMultipleColumns
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-muted-foreground cursor-not-allowed'
            }`}
            title={!hasMultipleColumns ? 'Cannot delete the last column' : undefined}
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
            Delete column
          </button>
        </div>
      )}

      {/* Simple delete confirmation (no tasks) */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Column"
        message="Are you sure you want to delete this column? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />

      {/* Move tasks options modal */}
      <Modal
        isOpen={showMoveOptions}
        onClose={() => setShowMoveOptions(false)}
        title="Delete Column"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This column contains tasks. What would you like to do with them?
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="secondary"
              onClick={handleMoveAndDelete}
              className="w-full justify-start"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Move tasks to previous column
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteWithTasks}
              className="w-full justify-start"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Delete tasks too
            </Button>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowMoveOptions(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
