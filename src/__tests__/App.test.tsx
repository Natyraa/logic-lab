import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

beforeEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders a 5x5 board by default", () => {
    render(<App />);
    expect(screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-pressed"))).toHaveLength(25);
  });

  it("offers three difficulty levels", () => {
    render(<App />);
    expect(screen.getByRole("option", { name: "Easy" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Medium" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Hard" })).toBeInTheDocument();
  });

  it("starts with Undo and Redo disabled", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
  });

  it("clicking a cell registers a move and enables Undo", async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-pressed"));
    await user.click(cells[0]);

    expect(screen.getByText("1")).toBeInTheDocument(); // move count readout
    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled();
  });

  it("New game resets the move count back to 0", async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-pressed"));
    await user.click(cells[0]);
    await user.click(screen.getByRole("button", { name: "New game" }));

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  });

  it("changing difficulty starts a fresh game", async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-pressed"));
    await user.click(cells[0]);
    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled();

    await user.selectOptions(screen.getByRole("combobox"), "hard");
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  });
});
