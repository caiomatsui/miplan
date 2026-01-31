/**
 * Format seconds into a human-readable time string.
 * Returns MM:SS for times under an hour, HH:MM:SS for times over an hour.
 */
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

/**
 * Calculate the total elapsed time including any active timer.
 * If timerStartedAt is set, adds the time since that timestamp to timeSpent.
 */
export const calculateElapsedTime = (
  timeSpent: number,
  timerStartedAt: number | null
): number => {
  if (!timerStartedAt) return timeSpent;
  const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
  return timeSpent + elapsed;
};
