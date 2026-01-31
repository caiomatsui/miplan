import { useState, useRef, useEffect } from 'react';
import { TaskPriority } from '@/types';

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'none', label: 'None', color: 'bg-muted-foreground' },
];

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const current = priorities.find((p) => p.value === value) || priorities[3];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={`w-2 h-2 rounded-full ${current.color}`} />
        <span className="text-sm text-foreground">{current.label}</span>
        <svg
          className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[120px]"
          role="listbox"
        >
          {priorities.map((p) => (
            <button
              key={p.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(p.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent text-left transition-colors"
              role="option"
              aria-selected={p.value === value}
            >
              <span className={`w-2 h-2 rounded-full ${p.color}`} />
              <span className="text-sm text-foreground">{p.label}</span>
              {p.value === value && (
                <svg
                  className="w-4 h-4 ml-auto text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
