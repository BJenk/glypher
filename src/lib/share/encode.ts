import LZString from "lz-string";
import type { Animation } from "@/store/animation";

export function encodeAnimation(a: Animation): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(a));
}

export function decodeAnimation(s: string): Animation | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(s);
    if (!json) return null;
    const a = JSON.parse(json) as Animation;
    if (a?.version !== 1 || !Array.isArray(a.frames)) return null;
    return a;
  } catch {
    return null;
  }
}
