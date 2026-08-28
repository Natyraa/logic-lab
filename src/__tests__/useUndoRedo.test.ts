import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "../hooks/useUndoRedo";

describe("useUndoRedo", () => {
  it("starts with the initial state and moveCount 0", () => {
    const { result } = renderHook(() => useUndoRedo("first"));
    expect(result.current.state).toBe("first");
    expect(result.current.moveCount).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("accepts a lazy initializer, called only once", () => {
    let calls = 0;
    const { result } = renderHook(() =>
      useUndoRedo(() => {
        calls += 1;
        return "lazy-value";
      })
    );
    expect(result.current.state).toBe("lazy-value");
    expect(calls).toBe(1);
  });

  it("set() pushes a new state and increments moveCount", () => {
    const { result } = renderHook(() => useUndoRedo(0));

    act(() => result.current.set(1));
    expect(result.current.state).toBe(1);
    expect(result.current.moveCount).toBe(1);
    expect(result.current.canUndo).toBe(true);
  });

  it("undo() steps back to the previous state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));

    act(() => result.current.undo());
    expect(result.current.state).toBe(1);
    expect(result.current.moveCount).toBe(1);
  });

  it("redo() re-applies an undone state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());

    act(() => result.current.redo());
    expect(result.current.state).toBe(1);
    expect(result.current.canRedo).toBe(false);
  });

  it("set() after an undo discards the redo branch", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo()); // back to 1, "2" is now the redo branch

    act(() => result.current.set(99)); // a new move from here
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.undo());
    expect(result.current.state).toBe(1); // not 2 — the old branch is gone
  });

  it("undo() is a no-op at the beginning of history", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.undo());
    expect(result.current.state).toBe(0);
  });

  it("redo() is a no-op at the end of history", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.redo());
    expect(result.current.state).toBe(1);
  });

  it("reset() replaces the entire history with a single new state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));

    act(() => result.current.reset(100));
    expect(result.current.state).toBe(100);
    expect(result.current.moveCount).toBe(0);
    expect(result.current.canUndo).toBe(false);
  });
});
