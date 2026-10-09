import LZString from "lz-string";
import type { Animation } from "../../store/animation";
import { parseAnimation } from "./validate";

export function encodeAnimation(a: Animation): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(a));
}

export function decodeAnimation(s: string): Animation | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(s);
    return json ? parseAnimation(JSON.parse(json)) : null;
  } catch {
    return null;
  }
}
