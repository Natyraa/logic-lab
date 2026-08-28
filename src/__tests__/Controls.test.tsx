import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controls } from "../components/Controls";
import type { Difficulty } from "../types/game";

const difficulties: Record<string, Difficulty> = {
  easy: { label: "Easy", scrambleMoves: 6 },
  hard: { label: "Hard", scrambleMoves: 24 },
};

describe("Controls", () => {
  it("renders an option per difficulty", () => {
    render(
      <Controls
        difficulties={difficulties}
        selectedDifficulty="easy"
        onDifficultyChange={() => {}}
        onNewGame={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
      />
    );
    expect(screen.getByRole("option", { name: "Easy" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Hard" })).toBeInTheDocument();
  });

  it("calls onDifficultyChange when the select changes", async () => {
    const user = userEvent.setup();
    const onDifficultyChange = jest.fn();
    render(
      <Controls
        difficulties={difficulties}
        selectedDifficulty="easy"
        onDifficultyChange={onDifficultyChange}
        onNewGame={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
      />
    );

    await user.selectOptions(screen.getByRole("combobox"), "hard");
    expect(onDifficultyChange).toHaveBeenCalledWith("hard");
  });

  it("disables Undo/Redo based on canUndo/canRedo", () => {
    render(
      <Controls
        difficulties={difficulties}
        selectedDifficulty="easy"
        onDifficultyChange={() => {}}
        onNewGame={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={true}
      />
    );

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).not.toBeDisabled();
  });

  it("calls onNewGame when New game is clicked", async () => {
    const user = userEvent.setup();
    const onNewGame = jest.fn();
    render(
      <Controls
        difficulties={difficulties}
        selectedDifficulty="easy"
        onDifficultyChange={() => {}}
        onNewGame={onNewGame}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "New game" }));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });
});
