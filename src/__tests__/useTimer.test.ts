import { renderHook, act } from "@testing-library/react";
import { useTimer, formatTime } from "../hooks/useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts at 0", () => {
    const { result } = renderHook(() => useTimer(false));
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("does not tick while isRunning is false", () => {
    const { result } = renderHook(() => useTimer(false));
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("ticks once per second while isRunning is true", () => {
    const { result } = renderHook(() => useTimer(true));
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.elapsedSeconds).toBe(3);
  });

  it("pauses without resetting when isRunning becomes false", () => {
    const { result, rerender } = renderHook(({ running }) => useTimer(running), {
      initialProps: { running: true },
    });

    act(() => jest.advanceTimersByTime(2000));
    rerender({ running: false });
    act(() => jest.advanceTimersByTime(5000));

    expect(result.current.elapsedSeconds).toBe(2);
  });

  it("reset() zeroes the count", () => {
    const { result } = renderHook(() => useTimer(true));
    act(() => jest.advanceTimersByTime(4000));
    act(() => result.current.reset());
    expect(result.current.elapsedSeconds).toBe(0);
  });
});

describe("formatTime", () => {
  it("formats seconds under a minute", () => {
    expect(formatTime(45)).toBe("0:45");
  });

  it("pads single-digit seconds", () => {
    expect(formatTime(5)).toBe("0:05");
  });

  it("formats minutes and seconds together", () => {
    expect(formatTime(125)).toBe("2:05");
  });
});
