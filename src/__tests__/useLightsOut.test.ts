import { renderHook, act } from "@testing-library/react";
import { useLightsOut } from "../hooks/useLightsOut";
import { createEmptyGrid, toggleCell, isSolved } from "../lib/grid";
import type { Grid } from "../types/game";

/**
 * A fixed, non-random puzzle for tests: toggling (0,0) then (2,2) from an
 * empty 3x3 grid. Their neighborhoods don't overlap, so the puzzle is
 * solvable by clicking exactly those same two cells, in either order —
 * which makes the hook's behavior fully predictable to assert on.
 */
function fixedPuzzleFactory(): Grid {
  return toggleCell(toggleCell(createEmptyGrid(3), 0, 0), 2, 2);
}

beforeEach(() => {
  localStorage.clear();
});

describe("useLightsOut", () => {
  it("starts in the generated puzzle state, playing, with 0 moves", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    expect(result.current.status).toBe("playing");
    expect(result.current.moveCount).toBe(0);
    expect(isSolved(result.current.grid)).toBe(false);
  });

  it("does not win after only one of the two required moves", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => result.current.toggle(0, 0));

    expect(result.current.status).toBe("playing");
    expect(result.current.moveCount).toBe(1);
  });

  it("wins after both required moves are made", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => result.current.toggle(0, 0));
    act(() => result.current.toggle(2, 2));

    expect(result.current.status).toBe("won");
    expect(result.current.moveCount).toBe(2);
    expect(isSolved(result.current.grid)).toBe(true);
  });

  it("ignores further clicks once the game is won", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => result.current.toggle(0, 0));
    act(() => result.current.toggle(2, 2));
    const wonGrid = result.current.grid;

    act(() => result.current.toggle(1, 1)); // should be a no-op now

    expect(result.current.grid).toEqual(wonGrid);
    expect(result.current.moveCount).toBe(2);
  });

  it("undo() steps back to the state before the last move", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );
    const initialGrid = result.current.grid;

    act(() => result.current.toggle(0, 0));
    act(() => result.current.undo());

    expect(result.current.grid).toEqual(initialGrid);
    expect(result.current.moveCount).toBe(0);
  });

  it("redo() re-applies an undone move", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => result.current.toggle(0, 0));
    const afterFirstMove = result.current.grid;
    act(() => result.current.undo());
    act(() => result.current.redo());

    expect(result.current.grid).toEqual(afterFirstMove);
    expect(result.current.moveCount).toBe(1);
  });

  it("disables undo once the game is won", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => result.current.toggle(0, 0));
    act(() => result.current.toggle(2, 2));

    expect(result.current.status).toBe("won");
    expect(result.current.canUndo).toBe(false);
  });

  it("newGame() resets moves, grid, and status", () => {
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => result.current.toggle(0, 0));
    act(() => result.current.toggle(2, 2));
    expect(result.current.status).toBe("won");

    act(() => result.current.newGame());

    expect(result.current.status).toBe("playing");
    expect(result.current.moveCount).toBe(0);
    expect(isSolved(result.current.grid)).toBe(false);
  });

  it("records a best time on the first win", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );

    act(() => jest.advanceTimersByTime(5000));
    act(() => result.current.toggle(0, 0));
    act(() => result.current.toggle(2, 2));

    expect(result.current.bestTime).toBe(5);
    jest.useRealTimers();
  });

  it("keeps the faster of two win times as the best", () => {
    jest.useFakeTimers();

    // First session: wins in 10s.
    const first = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );
    act(() => jest.advanceTimersByTime(10000));
    act(() => first.result.current.toggle(0, 0));
    act(() => first.result.current.toggle(2, 2));
    expect(first.result.current.bestTime).toBe(10);

    // Second session (fresh hook instance, same size/difficulty key):
    // wins slower, in 20s — best time should stay 10.
    const second = renderHook(() =>
      useLightsOut({ size: 3, scrambleMoves: 2, puzzleFactory: fixedPuzzleFactory })
    );
    act(() => jest.advanceTimersByTime(20000));
    act(() => second.result.current.toggle(0, 0));
    act(() => second.result.current.toggle(2, 2));

    expect(second.result.current.bestTime).toBe(10);
    jest.useRealTimers();
  });
});
