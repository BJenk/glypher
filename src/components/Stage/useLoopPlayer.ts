import { useEffect, useState } from "react";
import type { Frame } from "@/store/animation";

export function useLoopPlayer(frames: Frame[], speedMs: number, playing: boolean) {
  const [index, setIndex] = useState(0);

  // Per-frame durationMs override: schedule a setTimeout for the current frame's
  // duration (falling back to speedMs), then advance to the next frame index.
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const current = frames[index] ?? frames[0];
    const dur = current.durationMs ?? speedMs;
    const id = setTimeout(() => setIndex(i => (i + 1) % frames.length), dur);
    return () => clearTimeout(id);
  }, [index, playing, frames, speedMs]);

  // Keep index valid if frames shrink.
  useEffect(() => {
    if (index >= frames.length && frames.length > 0) setIndex(0);
  }, [frames.length, index]);

  return { index };
}
