import { Column } from '@/types';

interface ColumnSelectorProps {
  columns: Column[];
  value: string;
  onChange: (columnId: string) => void;
}

export function ColumnSelector({ columns, value, onChange }: ColumnSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
    >
      {columns.map((column) => (
        <option key={column.id} value={column.id}>
          {column.title}
        </option>
      ))}
    </select>
  );
}
