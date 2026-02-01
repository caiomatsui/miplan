import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Info } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        if (newProgress <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onClose, isPaused]);

  const iconMap = {
    success: (
      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-success" strokeWidth={2.5} />
      </div>
    ),
    error: (
      <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
        <X className="w-3 h-3 text-destructive" strokeWidth={2.5} />
      </div>
    ),
    info: (
      <div className="w-5 h-5 rounded-full bg-info/20 flex items-center justify-center">
        <Info className="w-3 h-3 text-info" strokeWidth={2.5} />
      </div>
    ),
  };

  const accentColors = {
    success: 'border-l-success',
    error: 'border-l-destructive',
    info: 'border-l-info',
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-slide-up"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          'flex items-center gap-3 px-4 py-3',
          'rounded-lg border border-border/50 shadow-lg',
          'bg-card text-card-foreground',
          'border-l-4',
          accentColors[type]
        )}
      >
        {iconMap[type]}
        <span className="text-sm font-medium pr-6">{message}</span>
        <button
          onClick={onClose}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'p-1 rounded-md',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-accent',
            'transition-colors duration-150'
          )}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
          <div
            className={cn(
              'h-full transition-all duration-50',
              type === 'success' && 'bg-success',
              type === 'error' && 'bg-destructive',
              type === 'info' && 'bg-info'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
