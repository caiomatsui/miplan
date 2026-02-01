import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useTaskActions } from '../../hooks/useTasks';
import { useUIStore } from '../../store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Maximize2, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  taskId: string;
}

export function TaskActions({ taskId }: TaskActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { deleteTask } = useTaskActions();
  const setSelectedTask = useUIStore((state) => state.setSelectedTask);

  const handleDelete = async () => {
    await deleteTask(taskId);
    setShowConfirm(false);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(taskId);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Expand/Open Details Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleExpand}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-150"
            aria-label="View details"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View details</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-150"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete task</p>
        </TooltipContent>
      </Tooltip>

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
    </div>
  );
}
