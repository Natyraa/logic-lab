import type { Grid } from "../types/game";

/**
 * grid.ts
 * -----------------------------------------------------------------------
 * The rules of Lights Out, as plain functions with no React and no
 * randomness (except generateSolvablePuzzle, which takes an injectable
 * random source specifically so it can be tested deterministically).
 * Every function here takes a grid in and returns a new grid out —
 * nothing here ever mutates the grid it was given.
 * -----------------------------------------------------------------------
 */

export function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => false));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

/**
 * Toggles the clicked cell and its orthogonal neighbors (up/down/left/
 * right — not diagonals). Returns a new grid; the one passed in is left
 * untouched.
 */
export function toggleCell(grid: Grid, row: number, col: number): Grid {
  const size = grid.length;
  const next = cloneGrid(grid);

  const cellsToFlip: [number, number][] = [
    [row, col],
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  for (const [r, c] of cellsToFlip) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      next[r][c] = !next[r][c];
    }
  }

  return next;
}

/** The win condition: every light is off. */
export function isSolved(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => cell === false));
}

export function countLitCells(grid: Grid): number {
  return grid.reduce((total, row) => total + row.filter(Boolean).length, 0);
}

/**
 * Builds a solvable puzzle by starting from the solved (all-off) grid and
 * applying `scrambleMoves` random toggles. This works because toggling
 * the same cell twice cancels out — so replaying the exact same sequence
 * of moves again always returns the grid to all-off, which is what
 * guarantees the result is solvable, regardless of how the moves overlap.
 *
 * `random` is injectable (defaults to Math.random) so tests can supply a
 * deterministic sequence instead of a real random one.
 */
export function generateSolvablePuzzle(
  size: number,
  scrambleMoves: number,
  random: () => number = Math.random
): Grid {
  let grid = createEmptyGrid(size);

  for (let i = 0; i < scrambleMoves; i++) {
    const row = Math.floor(random() * size);
    const col = Math.floor(random() * size);
    grid = toggleCell(grid, row, col);
  }

  // On the rare chance the scramble cancelled itself out completely,
  // nudge a single random cell so the puzzle never starts pre-solved.
  if (isSolved(grid)) {
    const row = Math.floor(random() * size);
    const col = Math.floor(random() * size);
    grid = toggleCell(grid, row, col);
  }

  return grid;
}
