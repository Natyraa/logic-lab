import type { Grid } from "../types/game";
import "./board.css";

interface BoardProps {
  grid: Grid;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

export function Board({ grid, onCellClick, disabled }: BoardProps) {
  const size = grid.length;

  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="group"
      aria-label={`${size} by ${size} light grid`}
    >
      {grid.map((row, rowIndex) =>
        row.map((isLit, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            type="button"
            className={`cell ${isLit ? "is-lit" : ""}`}
            aria-pressed={isLit}
            aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}, ${isLit ? "lit" : "unlit"}`}
            disabled={disabled}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}
