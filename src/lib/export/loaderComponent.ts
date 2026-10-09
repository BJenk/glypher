import type { Animation } from "../../store/animation";
import { jsString, preview } from "./faviconScript";

// A self-contained React component that plays the loop inside the page, like a
// loading spinner. Valid as both .jsx and strict .tsx: the props' types come
// from their defaults, so no annotations are needed. Next.js needs it marked
// as a client component.
export function loaderComponent(animation: Animation, { next = false } = {}): string {
  // The first comment says where the code goes: pasted into an existing file
  // (e.g. a Next.js layout), the directive and hooks fail to compile.
  const where = next
    ? "// Save this as its own file: app/components/GlyphLoader.tsx (not inside layout.tsx or a page)"
    : "// Save this as its own file, e.g. src/GlyphLoader.jsx (or .tsx)";
  const glyphs = animation.frames.map((f) => String.fromCodePoint(f.cp));
  const durations = animation.frames.map((f) => f.durationMs ?? animation.speedMs);
  const directive = next ? `"use client"; // it keeps state, so it runs in the browser\n` : "";
  return `${directive}${where}
// Glypher loop: ${preview(animation)}
import { useEffect, useState } from "react";

const FRAMES = [${glyphs.map(jsString).join(", ")}];
const MS = [${durations.join(", ")}]; // how long each frame shows

export function GlyphLoader({ label = "Loading", size = "1em", playing = true, className = "" } = {}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setI((i + 1) % FRAMES.length), MS[i]);
    return () => clearTimeout(id);
  }, [i, playing]);

  // Every frame sits in the same grid cell, so the loader is as wide as its
  // widest frame and doesn't jitter as frames change.
  return (
    <span
      role="status"
      aria-label={label}
      className={className}
      style={{ display: "inline-grid", fontSize: size, lineHeight: 1, verticalAlign: "middle" }}
    >
      {FRAMES.map((frame, n) => (
        <span
          key={n}
          aria-hidden="true"
          style={{ gridArea: "1 / 1", textAlign: "center", visibility: n === i ? "visible" : "hidden" }}
        >
          {frame}
        </span>
      ))}
    </span>
  );
}
`;
}
