import type { Animation } from "../../store/animation";
import { parseAnimation } from "../share/validate";

const KEY = "glypher:v1";

export function saveLocal(a: Animation): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* ignore quota / unavailable */
  }
}

export function loadLocal(): Animation | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseAnimation(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
