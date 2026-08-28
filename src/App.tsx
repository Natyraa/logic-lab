import { useState } from "react";
import type { Difficulty } from "./types/game";
import { useLightsOut } from "./hooks/useLightsOut";
import { Board } from "./components/Board";
import { Controls } from "./components/Controls";
import { StatusPanel } from "./components/StatusPanel";
import "./app.css";

const SIZE = 5;

const DIFFICULTIES: Record<string, Difficulty> = {
  easy: { label: "Easy", scrambleMoves: 6 },
  medium: { label: "Medium", scrambleMoves: 14 },
  hard: { label: "Hard", scrambleMoves: 24 },
};

export default function App() {
  const [difficultyKey, setDifficultyKey] = useState("medium");

  const game = useLightsOut({
    size: SIZE,
    scrambleMoves: DIFFICULTIES[difficultyKey].scrambleMoves,
  });

  function handleDifficultyChange(key: string) {
    setDifficultyKey(key);
    game.newGame(DIFFICULTIES[key].scrambleMoves);
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">Logic Lab</p>
        <h1>Lights Out</h1>
        <p>
          Click a tile to toggle it and its neighbors. Turn every light off to
          solve the board.
        </p>
      </header>

      <div className="game-layout">
        <Board grid={game.grid} onCellClick={game.toggle} disabled={game.status === "won"} />

        <div className="side-panel">
          <StatusPanel
            moveCount={game.moveCount}
            elapsedSeconds={game.elapsedSeconds}
            bestTime={game.bestTime}
            status={game.status}
          />
          <Controls
            difficulties={DIFFICULTIES}
            selectedDifficulty={difficultyKey}
            onDifficultyChange={handleDifficultyChange}
            onNewGame={() => game.newGame()}
            onUndo={game.undo}
            onRedo={game.redo}
            canUndo={game.canUndo}
            canRedo={game.canRedo}
          />
        </div>
      </div>

      <footer className="credits">
        Vanilla game state — no game engine, no external puzzle library.
      </footer>
    </div>
  );
}
