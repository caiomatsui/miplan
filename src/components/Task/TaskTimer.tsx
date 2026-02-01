import { useState, useEffect, useCallback } from 'react';
import { Task } from '../../types';
import { useTimer } from '../../hooks/useTimer';
import { formatTime, calculateElapsedTime } from '../../utils/time';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TaskTimerProps {
  task: Task;
  showResetButton?: boolean;
}

export function TaskTimer({ task, showResetButton = false }: TaskTimerProps) {
  const { toggleTimer, resetTimer, activeTimerTaskId } = useTimer();
  const [displayTime, setDisplayTime] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const isActive = activeTimerTaskId === task.id;

  // Update display time every second when active
  useEffect(() => {
    // Calculate initial display time
    setDisplayTime(calculateElapsedTime(task.timeSpent, task.timerStartedAt));

    if (isActive) {
      const interval = setInterval(() => {
        setDisplayTime(calculateElapsedTime(task.timeSpent, task.timerStartedAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, task.timeSpent, task.timerStartedAt]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleTimer(task.id);
    },
    [toggleTimer, task.id]
  );

  const handleResetClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResetConfirm(true);
  }, []);

  const handleResetConfirm = useCallback(async () => {
    await resetTimer(task.id);
    setShowResetConfirm(false);
  }, [resetTimer, task.id]);

  const handleResetCancel = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const hasTime = displayTime > 0 || isActive;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Play/Pause Button - always visible on hover, handled by parent */}
        <button
          onClick={handleToggle}
          className={`
            p-1 rounded transition-colors
            ${isActive
              ? 'text-green-600 hover:text-green-700 hover:bg-green-500/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }
          `}
          aria-label={isActive ? 'Pause timer' : 'Start timer'}
        >
          {isActive ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4" fill="currentColor" />
          )}
        </button>

        {/* Time display - only show if there's time or timer is active */}
        {hasTime && (
          <span className={`text-xs font-mono ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
            {formatTime(displayTime)}
          </span>
        )}

        {/* TRACKING badge */}
        {isActive && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            TRACKING
          </span>
        )}

        {/* Reset button - only in expanded view */}
        {showResetButton && hasTime && (
          <button
            onClick={handleResetClick}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Timer"
        message="Reset timer to 0? This will clear all tracked time for this task."
        onConfirm={handleResetConfirm}
        onCancel={handleResetCancel}
        confirmLabel="Reset"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}
