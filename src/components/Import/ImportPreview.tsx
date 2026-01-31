import { ParsedLine } from '../../utils/import';
import { Column } from '../../types';

interface ImportPreviewProps {
  lines: ParsedLine[];
  columns: Column[];
  selectedColumnId: string;
  onColumnChange: (columnId: string) => void;
  onToggleLine: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function ImportPreview({
  lines,
  columns,
  selectedColumnId,
  onColumnChange,
  onToggleLine,
  onSelectAll,
  onDeselectAll,
}: ImportPreviewProps) {
  const selectedCount = lines.filter((line) => line.selected).length;
  const allSelected = selectedCount === lines.length;
  const noneSelected = selectedCount === 0;

  return (
    <div className="space-y-4">
      {/* Column Selector */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="column-select"
          className="text-sm font-medium text-gray-700"
        >
          Add to column:
        </label>
        <select
          id="column-select"
          value={selectedColumnId}
          onChange={(e) => onColumnChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {selectedCount} of {lines.length} selected
        </span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Select all
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Deselect all
          </button>
        </div>
      </div>

      {/* Lines List */}
      <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
        {lines.map((line) => (
          <label
            key={line.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={line.selected}
              onChange={() => onToggleLine(line.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span
              className={`flex-1 text-sm truncate ${
                line.selected ? 'text-gray-900' : 'text-gray-400'
              }`}
              title={line.title}
            >
              {line.title}
            </span>
            {line.hasUrl && (
              <span
                className="text-blue-500 flex-shrink-0"
                title="Contains URL"
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </span>
            )}
          </label>
        ))}
      </div>

      {lines.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No lines to import
        </div>
      )}
    </div>
  );
}
