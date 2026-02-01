import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

interface AddBoardButtonProps {
  onClick: () => void;
}

export function AddBoardButton({ onClick }: AddBoardButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors duration-150 flex items-center gap-2"
          aria-label="New board"
        >
          <Plus className="w-4 h-4" />
          New Board
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>New board</p>
      </TooltipContent>
    </Tooltip>
  );
}
