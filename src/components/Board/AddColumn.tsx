import { useColumnActions } from '../../hooks/useColumns';
import { useUIStore } from '../../store';

interface AddColumnProps {
  onColumnCreated?: (columnId: string) => void;
}

export function AddColumn({ onColumnCreated }: AddColumnProps) {
  const activeBoardId = useUIStore((state) => state.activeBoardId);
  const { createColumn } = useColumnActions();

  const handleAddColumn = async () => {
    if (!activeBoardId) return;

    const newColumnId = await createColumn(activeBoardId, 'New Column');
    onColumnCreated?.(newColumnId);
  };

  return (
    <button
      className="w-[280px] flex-shrink-0 h-fit bg-secondary hover:bg-accent border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150"
      onClick={handleAddColumn}
    >
      <span className="text-2xl mr-2">+</span>
      <span className="text-sm font-medium">Add column</span>
    </button>
  );
}
