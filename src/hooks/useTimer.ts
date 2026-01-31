import { useCallback } from 'react';
import { db } from '../db';
import { useUIStore } from '../store';

/**
 * Hook for managing task timers.
 * Ensures only one timer is active at a time.
 * Timer state persists across page refreshes using timerStartedAt timestamp.
 */
export const useTimer = () => {
  const activeTimerTaskId = useUIStore((state) => state.activeTimerTaskId);
  const setActiveTimerTaskId = useUIStore((state) => state.startTimer);
  const clearActiveTimer = useUIStore((state) => state.stopTimer);

  /**
   * Stop the timer for a specific task and save elapsed time.
   */
  const stopTimerForTask = useCallback(async (taskId: string) => {
    const task = await db.tasks.get(taskId);
    if (task && task.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - task.timerStartedAt) / 1000);
      await db.tasks.update(taskId, {
        timeSpent: task.timeSpent + elapsed,
        timerStartedAt: null,
        updatedAt: Date.now(),
      });
    }
  }, []);

  /**
   * Start a timer for a task.
   * If another timer is running, it will be stopped and its time saved first.
   */
  const startTimer = useCallback(
    async (taskId: string) => {
      // Stop the previous timer if it exists and is different
      if (activeTimerTaskId && activeTimerTaskId !== taskId) {
        await stopTimerForTask(activeTimerTaskId);
      }

      // Start the new timer
      await db.tasks.update(taskId, {
        timerStartedAt: Date.now(),
        updatedAt: Date.now(),
      });
      setActiveTimerTaskId(taskId);
    },
    [activeTimerTaskId, stopTimerForTask, setActiveTimerTaskId]
  );

  /**
   * Stop the currently active timer and save the elapsed time.
   */
  const stopTimer = useCallback(async () => {
    if (!activeTimerTaskId) return;
    await stopTimerForTask(activeTimerTaskId);
    clearActiveTimer();
  }, [activeTimerTaskId, stopTimerForTask, clearActiveTimer]);

  /**
   * Reset the timer for a task to zero.
   * If the timer is running, it will be stopped first.
   */
  const resetTimer = useCallback(
    async (taskId: string) => {
      // If this task has the active timer, clear it from the store
      if (activeTimerTaskId === taskId) {
        clearActiveTimer();
      }

      // Reset the task's time tracking fields
      await db.tasks.update(taskId, {
        timeSpent: 0,
        timerStartedAt: null,
        updatedAt: Date.now(),
      });
    },
    [activeTimerTaskId, clearActiveTimer]
  );

  /**
   * Toggle the timer for a task.
   * If the task's timer is running, stop it. Otherwise, start it.
   */
  const toggleTimer = useCallback(
    async (taskId: string) => {
      if (activeTimerTaskId === taskId) {
        await stopTimer();
      } else {
        await startTimer(taskId);
      }
    },
    [activeTimerTaskId, startTimer, stopTimer]
  );

  return {
    startTimer,
    stopTimer,
    resetTimer,
    toggleTimer,
    activeTimerTaskId,
  };
};
