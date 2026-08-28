import { useCallback, useReducer } from "react";

interface HistoryState<T> {
  history: T[];
  index: number;
}

type HistoryAction<T> =
  | { type: "SET"; value: T }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; value: T };

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  switch (action.type) {
    case "SET": {
      // If the pointer isn't at the end (the user undid a few steps, then
      // made a new move), discard everything after it first — standard
      // undo/redo behavior in any editor.
      const withoutFuture = state.history.slice(0, state.index + 1);
      return { history: [...withoutFuture, action.value], index: withoutFuture.length };
    }
    case "UNDO":
      return state.index > 0 ? { ...state, index: state.index - 1 } : state;
    case "REDO":
      return state.index < state.history.length - 1 ? { ...state, index: state.index + 1 } : state;
    case "RESET":
      return { history: [action.value], index: 0 };
    default:
      return state;
  }
}

/**
 * A generic history stack — works for any state shape T, not just a game
 * grid. History is one array plus a pointer into it (via useReducer)
 * rather than separate "past"/"future" stacks; that keeps `set` after an
 * undo (discarding the redo branch) a single, obviously-correct case in
 * the reducer instead of logic spread across multiple setState calls.
 */
export function useUndoRedo<T>(initialPresent: T | (() => T)) {
  const [state, dispatch] = useReducer(
    historyReducer<T>,
    initialPresent,
    (init): HistoryState<T> => ({
      history: [typeof init === "function" ? (init as () => T)() : init],
      index: 0,
    })
  );

  const set = useCallback((value: T) => dispatch({ type: "SET", value }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const reset = useCallback((value: T) => dispatch({ type: "RESET", value }), []);

  return {
    state: state.history[state.index],
    set,
    undo,
    redo,
    reset,
    canUndo: state.index > 0,
    canRedo: state.index < state.history.length - 1,
    moveCount: state.index,
  };
}
