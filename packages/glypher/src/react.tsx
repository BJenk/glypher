import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { normalizeLoop, onReducedMotionChange, prefersReducedMotion, runLoop, type FramesInput, type Loop } from "./core";
import { startFavicon } from "./favicon";

interface Timing {
  frames: FramesInput;
  speed?: number;
  durations?: readonly number[];
}

// Props arrive as fresh arrays on every render; keying by value means timers
// only restart when the animation actually changes.
function useLoop({ frames, speed, durations }: Timing): [Loop, string] {
  const key = JSON.stringify([frames, speed, durations]);
  const loop = useMemo(() => normalizeLoop({ frames, speed, durations }), [key]);
  return [loop, key];
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(prefersReducedMotion());
    return onReducedMotionChange(setReduced);
  }, []);
  return reduced;
}

export interface GlyphLoopProps extends Timing {
  label?: string;
  size?: string | number;
  playing?: boolean;
  className?: string;
  style?: CSSProperties;
}

// A loop that plays inside the page, like a loading spinner.
export function GlyphLoop({ label = "Loading", size = "1em", playing = true, className, style, ...timing }: GlyphLoopProps) {
  const [loop, key] = useLoop(timing);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (!playing || reduced) return;
    return runLoop(loop.durations, setIndex, indexRef.current);
  }, [key, playing, reduced]);

  if (loop.frames.length === 0) return null;
  const shown = reduced || index >= loop.frames.length ? 0 : index;
  // Every frame sits in the same grid cell, so the loop is as wide as its
  // widest frame and doesn't jitter as frames change.
  return (
    <span
      role="status"
      aria-label={label}
      className={className}
      style={{ display: "inline-grid", fontSize: size, lineHeight: 1, verticalAlign: "middle", ...style }}
    >
      {loop.frames.map((frame, n) => (
        <span
          key={n}
          aria-hidden="true"
          style={{ gridArea: "1 / 1", textAlign: "center", visibility: n === shown ? "visible" : "hidden" }}
        >
          {frame}
        </span>
      ))}
    </span>
  );
}

export interface GlyphFaviconProps extends Timing {
  playing?: boolean;
  font?: string;
}

// Plays the loop as the browser tab's icon while mounted and playing.
export function GlyphFavicon({ playing = true, font, ...timing }: GlyphFaviconProps) {
  const [loop, key] = useLoop(timing);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!playing) return;
    const still = { frames: loop.frames.slice(0, 1), durations: loop.durations.slice(0, 1) };
    return startFavicon(reduced ? still : loop, { font });
  }, [key, playing, reduced, font]);
  return null;
}
