import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "../components/Board";
import { createEmptyGrid, toggleCell } from "../lib/grid";

describe("Board", () => {
  it("renders one button per cell", () => {
    render(<Board grid={createEmptyGrid(3)} onCellClick={() => {}} disabled={false} />);
    expect(screen.getAllByRole("button")).toHaveLength(9);
  });

  it("marks lit cells with aria-pressed=true and unlit with false", () => {
    const grid = toggleCell(createEmptyGrid(2), 0, 0);
    render(<Board grid={grid} onCellClick={() => {}} disabled={false} />);

    const litCell = screen.getByLabelText("Row 1, column 1, lit");
    const unlitCell = screen.getByLabelText("Row 2, column 2, unlit");

    expect(litCell).toHaveAttribute("aria-pressed", "true");
    expect(unlitCell).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onCellClick with the correct row and column", async () => {
    const user = userEvent.setup();
    const onCellClick = jest.fn();
    render(<Board grid={createEmptyGrid(3)} onCellClick={onCellClick} disabled={false} />);

    await user.click(screen.getByLabelText("Row 2, column 3, unlit"));
    expect(onCellClick).toHaveBeenCalledWith(1, 2);
  });

  it("disables every cell when disabled is true", () => {
    render(<Board grid={createEmptyGrid(2)} onCellClick={() => {}} disabled={true} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
