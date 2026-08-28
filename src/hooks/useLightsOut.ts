import { useEffect, useState } from "react";
import type { Grid, GameStatus } from "../types/game";
import { toggleCell, isSolved, generateSolvablePuzzle } from "../lib/grid";
import { loadBestTime, saveBestTime } from "../lib/bestTime";
import { useUndoRedo } from "./useUndoRedo";
import { useTimer } from "./useTimer";

interface UseLightsOutOptions {
  size?: number;
  scrambleMoves?: number;
  /**
   * Defaults to the real random puzzle generator. Tests override this to
   * get a known, deterministic starting grid instead of a random one —
   * dependency injection, applied to a hook.
   */
  puzzleFactory?: (size: number, scrambleMoves: number) => Grid;
}

export function useLightsOut({
  size = 5,
  scrambleMoves = 15,
  puzzleFactory = generateSolvablePuzzle,
}: UseLightsOutOptions = {}) {
  const gridHistory = useUndoRedo<Grid>(() => puzzleFactory(size, scrambleMoves));
  const [status, setStatus] = useState<GameStatus>("playing");
  const timer = useTimer(status === "playing");
  const [bestTime, setBestTime] = useState<number | null>(() => loadBestTime(size, scrambleMoves));

  // Win detection: only fires after at least one real move, so a puzzle
  // that (rarely) generates already-solved doesn't instantly show "won"
  // before the player has done anything.
  useEffect(() => {
    if (status === "playing" && gridHistory.moveCount > 0 && isSolved(gridHistory.state)) {
      setStatus("won");
    }
  }, [gridHistory.state, gridHistory.moveCount, status]);

  // Best-time bookkeeping, separate from win detection itself so the two
  // concerns (did they win / was it their best) stay independently easy
  // to follow and to test.
  useEffect(() => {
    if (status !== "won") return;

    setBestTime((prevBest) => {
      if (prevBest === null || timer.elapsedSeconds < prevBest) {
        saveBestTime(size, scrambleMoves, timer.elapsedSeconds);
        return timer.elapsedSeconds;
      }
      return prevBest;
    });
    // Only run once per win — timer.elapsedSeconds is intentionally read,
    // not depended on, so this doesn't re-fire every second afterward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function toggle(row: number, col: number) {
    if (status !== "playing") return;
    gridHistory.set(toggleCell(gridHistory.state, row, col));
  }

  function newGame(nextScrambleMoves: number = scrambleMoves) {
    gridHistory.reset(puzzleFactory(size, nextScrambleMoves));
    setStatus("playing");
    timer.reset();
  }

  function undo() {
    if (status !== "playing") return;
    gridHistory.undo();
  }

  function redo() {
    if (status !== "playing") return;
    gridHistory.redo();
  }

  return {
    grid: gridHistory.state,
    status,
    moveCount: gridHistory.moveCount,
    canUndo: gridHistory.canUndo && status === "playing",
    canRedo: gridHistory.canRedo && status === "playing",
    elapsedSeconds: timer.elapsedSeconds,
    bestTime,
    toggle,
    undo,
    redo,
    newGame,
  };
}
