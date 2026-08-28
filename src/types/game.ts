/** true = lit, false = unlit. A grid is a 2D array of rows. */
export type Grid = boolean[][];

export interface Position {
  row: number;
  col: number;
}

export type GameStatus = "playing" | "won";

export interface Difficulty {
  label: string;
  /** How many random toggles are applied to generate the puzzle. */
  scrambleMoves: number;
}
