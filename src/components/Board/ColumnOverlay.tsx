import { Column as ColumnType } from '../../types';

interface ColumnOverlayProps {
  column: ColumnType;
  taskCount: number;
}

export function ColumnOverlay({ column, taskCount }: ColumnOverlayProps) {
  return (
    <div
      className="
        w-[280px] bg-secondary rounded-lg flex flex-col
        shadow-xl ring-2 ring-primary ring-opacity-50
        opacity-90 rotate-2 scale-105
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {taskCount}
        </span>
      </div>

      {/* Placeholder for tasks */}
      <div className="flex-1 px-2 pb-2 min-h-[100px]">
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-8">
          {taskCount > 0 ? `${taskCount} task${taskCount !== 1 ? 's' : ''}` : 'No tasks'}
        </div>
      </div>
    </div>
  );
}
