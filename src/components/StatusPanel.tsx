import { formatTime } from "../hooks/useTimer";
import "./statusPanel.css";

interface StatusPanelProps {
  moveCount: number;
  elapsedSeconds: number;
  bestTime: number | null;
  status: "playing" | "won";
}

export function StatusPanel({ moveCount, elapsedSeconds, bestTime, status }: StatusPanelProps) {
  return (
    <div className="status-panel">
      <div className="status-readout">
        <div className="readout">
          <p className="readout-label">Moves</p>
          <p className="readout-value">{moveCount}</p>
        </div>
        <div className="readout">
          <p className="readout-label">Time</p>
          <p className="readout-value">{formatTime(elapsedSeconds)}</p>
        </div>
        <div className="readout">
          <p className="readout-label">Best</p>
          <p className="readout-value">{bestTime !== null ? formatTime(bestTime) : "—"}</p>
        </div>
      </div>

      {status === "won" && (
        <p className="win-message" role="status">
          Solved in {moveCount} move{moveCount === 1 ? "" : "s"} — {formatTime(elapsedSeconds)}
        </p>
      )}
    </div>
  );
}
