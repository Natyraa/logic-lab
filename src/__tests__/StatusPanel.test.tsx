import { render, screen } from "@testing-library/react";
import { StatusPanel } from "../components/StatusPanel";

describe("StatusPanel", () => {
  it("shows move count and formatted time", () => {
    render(<StatusPanel moveCount={7} elapsedSeconds={65} bestTime={null} status="playing" />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("shows an em dash for best time when there isn't one yet", () => {
    render(<StatusPanel moveCount={0} elapsedSeconds={0} bestTime={null} status="playing" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats an existing best time", () => {
    render(<StatusPanel moveCount={0} elapsedSeconds={0} bestTime={42} status="playing" />);
    expect(screen.getByText("0:42")).toBeInTheDocument();
  });

  it("shows a win message only when status is won", () => {
    const { rerender } = render(
      <StatusPanel moveCount={5} elapsedSeconds={30} bestTime={30} status="playing" />
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<StatusPanel moveCount={5} elapsedSeconds={30} bestTime={30} status="won" />);
    expect(screen.getByRole("status")).toHaveTextContent("Solved in 5 moves — 0:30");
  });

  it("uses singular 'move' for exactly one move", () => {
    render(<StatusPanel moveCount={1} elapsedSeconds={10} bestTime={null} status="won" />);
    expect(screen.getByRole("status")).toHaveTextContent("Solved in 1 move — 0:10");
  });
});
