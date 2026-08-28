import { useEffect, useState, useCallback } from "react";

/**
 * Counts elapsed whole seconds while `isRunning` is true. Pausing (by
 * passing isRunning=false) just stops the interval — the count picks up
 * from where it left off if isRunning becomes true again, rather than
 * resetting, since only `reset()` should ever zero it out.
 */
export function useTimer(isRunning: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = useCallback(() => setElapsedSeconds(0), []);

  return { elapsedSeconds, reset };
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
