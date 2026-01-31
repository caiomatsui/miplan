import { Column as ColumnType } from '../../types';

interface ColumnOverlayProps {
  column: ColumnType;
  taskCount: number;
}

export function ColumnOverlay({ column, taskCount }: ColumnOverlayProps) {
  return (
    <div
      className="
        w-[280px] bg-gray-100 rounded-lg flex flex-col
        shadow-xl ring-2 ring-blue-400 ring-opacity-50
        opacity-90 rotate-2 scale-105
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          {taskCount}
        </span>
      </div>

      {/* Placeholder for tasks */}
      <div className="flex-1 px-2 pb-2 min-h-[100px]">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm py-8">
          {taskCount > 0 ? `${taskCount} task${taskCount !== 1 ? 's' : ''}` : 'No tasks'}
        </div>
      </div>
    </div>
  );
}
