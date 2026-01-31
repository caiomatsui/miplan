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
      className="w-[280px] flex-shrink-0 h-fit bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-150"
      onClick={handleAddColumn}
    >
      <span className="text-2xl mr-2">+</span>
      <span className="text-sm font-medium">Add column</span>
    </button>
  );
}
