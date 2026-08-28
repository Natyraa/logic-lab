import {
  createEmptyGrid,
  toggleCell,
  isSolved,
  countLitCells,
  generateSolvablePuzzle,
} from "../lib/grid";

describe("createEmptyGrid", () => {
  it("creates a size x size grid, all unlit", () => {
    const grid = createEmptyGrid(3);
    expect(grid).toHaveLength(3);
    expect(grid.every((row) => row.length === 3)).toBe(true);
    expect(grid.every((row) => row.every((cell) => cell === false))).toBe(true);
  });
});

describe("toggleCell", () => {
  it("flips the clicked cell and its 4 orthogonal neighbors in the interior", () => {
    const grid = createEmptyGrid(5);
    const next = toggleCell(grid, 2, 2);

    expect(next[2][2]).toBe(true); // clicked cell
    expect(next[1][2]).toBe(true); // up
    expect(next[3][2]).toBe(true); // down
    expect(next[2][1]).toBe(true); // left
    expect(next[2][3]).toBe(true); // right

    // everything else stays off
    const flippedCount = next.flat().filter(Boolean).length;
    expect(flippedCount).toBe(5);
  });

  it("only flips 3 cells for a corner (no out-of-bounds neighbors)", () => {
    const grid = createEmptyGrid(5);
    const next = toggleCell(grid, 0, 0);

    expect(next[0][0]).toBe(true);
    expect(next[0][1]).toBe(true);
    expect(next[1][0]).toBe(true);
    expect(next.flat().filter(Boolean).length).toBe(3);
  });

  it("only flips 4 cells for an edge (non-corner) cell", () => {
    const grid = createEmptyGrid(5);
    const next = toggleCell(grid, 0, 2);
    expect(next.flat().filter(Boolean).length).toBe(4);
  });

  it("does not mutate the grid it was given", () => {
    const grid = createEmptyGrid(3);
    const original = grid.map((row) => [...row]);
    toggleCell(grid, 1, 1);
    expect(grid).toEqual(original);
  });

  it("toggling the same cell twice returns to the original state (self-inverse)", () => {
    const grid = createEmptyGrid(4);
    const once = toggleCell(grid, 1, 2);
    const twice = toggleCell(once, 1, 2);
    expect(twice).toEqual(grid);
  });
});

describe("isSolved", () => {
  it("is true for an all-off grid", () => {
    expect(isSolved(createEmptyGrid(4))).toBe(true);
  });

  it("is false if any cell is lit", () => {
    const grid = toggleCell(createEmptyGrid(4), 0, 0);
    expect(isSolved(grid)).toBe(false);
  });
});

describe("countLitCells", () => {
  it("counts zero for an empty grid", () => {
    expect(countLitCells(createEmptyGrid(5))).toBe(0);
  });

  it("counts correctly after a toggle", () => {
    const grid = toggleCell(createEmptyGrid(5), 2, 2);
    expect(countLitCells(grid)).toBe(5);
  });
});

describe("generateSolvablePuzzle", () => {
  it("is deterministic given an injected random source", () => {
    const sequence = [0.1, 0.1, 0.9, 0.9];
    let i = 0;
    const random = () => sequence[i++ % sequence.length];

    const a = generateSolvablePuzzle(4, 2, random);
    i = 0;
    const b = generateSolvablePuzzle(4, 2, random);

    expect(a).toEqual(b);
  });

  it("is always solvable — replaying the same generating moves again solves it", () => {
    const moves: [number, number][] = [
      [0, 0],
      [2, 2],
      [1, 3],
      [4, 4],
    ];
    let i = 0;
    // Encode row/col pairs as two calls per move: row then col.
    const flatMoves = moves.flat();
    const random = () => flatMoves[i++] / 5; // divided by size to land back on the right index

    let grid = generateSolvablePuzzle(5, moves.length, random);
    expect(isSolved(grid)).toBe(false);

    // Replaying the identical moves again cancels every toggle out.
    for (const [row, col] of moves) {
      grid = toggleCell(grid, row, col);
    }
    expect(isSolved(grid)).toBe(true);
  });

  it("never returns an already-solved puzzle", () => {
    const random = () => 0; // every move targets (0, 0) — would cancel out on even counts
    const grid = generateSolvablePuzzle(3, 4, random);
    expect(isSolved(grid)).toBe(false);
  });
});
