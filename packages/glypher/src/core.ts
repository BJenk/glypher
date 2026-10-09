// The rules every entry point shares: turns loose input (props, HTML
// attributes, anything a page passes) into a bounded, well-formed loop.

export const DEFAULT_SPEED = 150; // ms per frame
export const MIN_MS = 16;
export const MAX_MS = 10_000;
export const MAX_FRAMES = 64;
const MAX_FRAME_LENGTH = 16; // UTF-16 code units

export type FramesInput = string | readonly string[];

export interface LoopInput {
  frames: FramesInput;
  speed?: number | string;
  durations?: readonly number[];
}

export interface Loop {
  frames: string[];
  durations: number[]; // same length as frames
}

const segmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

// Whitespace-separated words if there's any whitespace, so a frame can be
// several characters; otherwise one frame per grapheme, so emoji sequences
// and flags stay whole.
export function splitGlyphs(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length !== 1) return words;
  return segmenter ? Array.from(segmenter.segment(words[0]), (s) => s.segment) : Array.from(words[0]);
}

export function clampMs(value: unknown, fallback: number): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.min(MAX_MS, Math.max(MIN_MS, Math.round(n)));
}

export function normalizeLoop({ frames, speed, durations }: LoopInput): Loop {
  const base = clampMs(speed, DEFAULT_SPEED);
  const given: readonly unknown[] = Array.isArray(durations) ? durations : [];
  const list: readonly unknown[] = typeof frames === "string" ? splitGlyphs(frames) : Array.isArray(frames) ? frames : [];
  // Pair before filtering, so each duration stays with its frame.
  const pairs = list
    .map((frame, i) => [frame, given[i]] as const)
    .filter((p): p is readonly [string, unknown] => typeof p[0] === "string" && p[0].length > 0 && p[0].length <= MAX_FRAME_LENGTH)
    .slice(0, MAX_FRAMES);
  return { frames: pairs.map(([f]) => f), durations: pairs.map(([, d]) => clampMs(d, base)) };
}

// "100,100,400" → [100, 100, 400]; empty entries become NaN, which
// normalizeLoop replaces with the speed.
export function parseDurations(attr: string | null): number[] {
  if (!attr) return [];
  return attr.split(",").map((s) => (s.trim() === "" ? NaN : Number(s)));
}

// Advances through the frames on their own durations. Returns a stop function.
export function runLoop(durations: readonly number[], onFrame: (index: number) => void, start = 0): () => void {
  if (durations.length < 2) return () => {};
  let i = start % durations.length;
  let timer = setTimeout(function tick() {
    i = (i + 1) % durations.length;
    onFrame(i);
    timer = setTimeout(tick, durations[i]);
  }, durations[i]);
  return () => clearTimeout(timer);
}

const REDUCE = "(prefers-reduced-motion: reduce)";

function reduceQuery(): MediaQueryList | null {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(REDUCE) : null;
}

export function prefersReducedMotion(): boolean {
  return reduceQuery()?.matches ?? false;
}

export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  const mq = reduceQuery();
  if (!mq) return () => {};
  const handler = () => callback(mq.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
