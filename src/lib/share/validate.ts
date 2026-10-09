import { MAX_FRAMES, type Animation, type Frame } from "../../store/animation";

// Share links and saved work are untrusted input: a link can carry anything.
// Only well-formed v1 animations get through, rebuilt from known fields.

const HEX = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i;
const isMs = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 16 && n <= 10_000;
const isHex = (s: unknown): s is string => typeof s === "string" && HEX.test(s);

function parseFrame(value: unknown): Frame | null {
  if (!value || typeof value !== "object") return null;
  const { id, cp, color, durationMs } = value as Record<string, unknown>;
  if (typeof id !== "string" || id.length === 0 || id.length > 64) return null;
  if (typeof cp !== "number" || !Number.isInteger(cp) || cp < 0 || cp > 0x10ffff) return null;
  if (color !== undefined && !isHex(color)) return null;
  if (durationMs !== undefined && !isMs(durationMs)) return null;
  const frame: Frame = { id, cp };
  if (color !== undefined) frame.color = color;
  if (durationMs !== undefined) frame.durationMs = durationMs;
  return frame;
}

export function parseAnimation(value: unknown): Animation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const a = value as Record<string, unknown>;
  if (a.version !== 1 || !Array.isArray(a.frames) || a.frames.length > MAX_FRAMES) return null;
  if (!isMs(a.speedMs) || !isHex(a.background) || !isHex(a.ink)) return null;
  const frames: Frame[] = [];
  for (const f of a.frames) {
    const frame = parseFrame(f);
    if (!frame) return null;
    frames.push(frame);
  }
  return { version: 1, loop: true, speedMs: a.speedMs, background: a.background, ink: a.ink, frames };
}
