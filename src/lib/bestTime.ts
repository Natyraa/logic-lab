/**
 * Thin wrapper around localStorage for best-completion-time persistence,
 * keyed by puzzle size + difficulty so a best time for 5x5/hard doesn't
 * get mixed up with 3x3/easy. Wrapped in try/catch since localStorage can
 * throw (private browsing, storage disabled) — a missing best time isn't
 * worth crashing the game over.
 */

const PREFIX = "logic-lab:best-time";

function key(size: number, scrambleMoves: number): string {
  return `${PREFIX}:${size}:${scrambleMoves}`;
}

export function loadBestTime(size: number, scrambleMoves: number): number | null {
  try {
    const raw = localStorage.getItem(key(size, scrambleMoves));
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function saveBestTime(size: number, scrambleMoves: number, seconds: number): void {
  try {
    localStorage.setItem(key(size, scrambleMoves), String(seconds));
  } catch {
    // ignore — best time is a nice-to-have, not critical
  }
}
