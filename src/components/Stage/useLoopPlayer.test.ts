import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoopPlayer } from "./useLoopPlayer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const frames = [{ id: "a", cp: 1 }, { id: "b", cp: 2 }, { id: "c", cp: 3 }];

describe("useLoopPlayer", () => {
  it("advances and wraps", () => {
    const { result } = renderHook(() => useLoopPlayer(frames, 100, true));
    expect(result.current.index).toBe(0);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.index).toBe(1);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.index).toBe(2);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.index).toBe(0);
  });
  it("does not advance when paused", () => {
    const { result } = renderHook(() => useLoopPlayer(frames, 100, false));
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.index).toBe(0);
  });
  it("stays at 0 with no frames", () => {
    const { result } = renderHook(() => useLoopPlayer([], 100, true));
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.index).toBe(0);
  });
  it("honors per-frame durationMs override", () => {
    const mixedFrames = [
      { id: "a", cp: 1, durationMs: 50 },
      { id: "b", cp: 2 },
    ];
    const { result } = renderHook(() => useLoopPlayer(mixedFrames, 100, true));
    expect(result.current.index).toBe(0);
    // Frame a has durationMs:50 — advances after 50ms
    act(() => vi.advanceTimersByTime(50));
    expect(result.current.index).toBe(1);
    // Frame b has no durationMs — falls back to speedMs:100
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.index).toBe(0);
  });
});
