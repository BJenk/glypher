import type { Animation } from "@/store/animation";

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
    if (!raw) return null;
    const a = JSON.parse(raw) as Animation;
    return a?.version === 1 && Array.isArray(a.frames) ? a : null;
  } catch {
    return null;
  }
}
