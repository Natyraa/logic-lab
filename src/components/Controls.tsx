import type { Difficulty } from "../types/game";
import "./controls.css";

interface ControlsProps {
  difficulties: Record<string, Difficulty>;
  selectedDifficulty: string;
  onDifficultyChange: (key: string) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Controls({
  difficulties,
  selectedDifficulty,
  onDifficultyChange,
  onNewGame,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ControlsProps) {
  return (
    <div className="controls">
      <label className="difficulty-select">
        <span className="sr-only">Difficulty</span>
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          {Object.entries(difficulties).map(([key, difficulty]) => (
            <option key={key} value={key}>
              {difficulty.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
        Undo
      </button>
      <button type="button" className="btn" onClick={onRedo} disabled={!canRedo}>
        Redo
      </button>
      <button type="button" className="btn btn-primary" onClick={onNewGame}>
        New game
      </button>
    </div>
  );
}
