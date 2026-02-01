import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MoreVertical, Pencil, Palette, Trash2, ArrowLeft, Check } from 'lucide-react';
import { COLUMN_COLORS } from '../../constants/columnColors';
import type { ColumnColor } from '../../types';

interface ColumnMenuProps {
  columnId: string;
  currentColor?: ColumnColor;
  hasMultipleColumns: boolean;
  hasTasks: boolean;
  onEdit: () => void;
  onChangeColor: (color: ColumnColor) => void;
  onDelete: (moveTasksTo?: string) => void;
  getPreviousColumnId: () => string | null;
}

export function ColumnMenu({
  columnId: _columnId,
  currentColor = 'slate',
  hasMultipleColumns,
  hasTasks,
  onEdit,
  onChangeColor,
  onDelete,
  getPreviousColumnId,
}: ColumnMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveOptions, setShowMoveOptions] = useState(false);

  const handleDeleteClick = () => {
    if (!hasMultipleColumns) {
      // Can't delete last column - do nothing
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Column options"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit title
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              Change color
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {COLUMN_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.key}
                  onClick={() => onChangeColor(color.key)}
                >
                  <div
                    className="mr-2 h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: color.light }}
                  />
                  {color.name}
                  {currentColor === color.key && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            destructive
            onClick={handleDeleteClick}
            disabled={!hasMultipleColumns}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete column
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Move tasks to previous column
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteWithTasks}
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
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
    </>
  );
}
