import { create } from "zustand";

export type Frame = {
  id: string;
  cp: number;
  color?: string;
  durationMs?: number;
};

export type Animation = {
  version: 1;
  frames: Frame[];
  speedMs: number;
  loop: true;
  background: string;
  ink: string;
};

export function createInitialAnimation(): Animation {
  return {
    version: 1,
    frames: [],
    speedMs: 150,
    loop: true,
    background: "#ffffff",
    ink: "#111111",
  };
}

let idCounter = 0;
function nextFrameId(): string {
  idCounter += 1;
  return `f${idCounter}`;
}

type State = {
  animation: Animation;
  addFrame: (cp: number) => void;
  removeFrame: (id: string) => void;
  reorderFrame: (from: number, to: number) => void;
  setGlobal: (patch: Partial<Omit<Animation, "version" | "loop">>) => void;
  loadAnimation: (a: Animation) => void;
  clear: () => void;
};

export const useAnimation = create<State>((set) => ({
  animation: createInitialAnimation(),
  addFrame: (cp) =>
    set((s) => ({
      animation: { ...s.animation, frames: [...s.animation.frames, { id: nextFrameId(), cp }] },
    })),
  removeFrame: (id) =>
    set((s) => ({
      animation: { ...s.animation, frames: s.animation.frames.filter((f) => f.id !== id) },
    })),
  reorderFrame: (from, to) =>
    set((s) => {
      const frames = s.animation.frames.slice();
      if (from < 0 || from >= frames.length || to < 0 || to >= frames.length || from === to) return s;
      const [moved] = frames.splice(from, 1);
      frames.splice(to, 0, moved);
      return { animation: { ...s.animation, frames } };
    }),
  setGlobal: (patch) => set((s) => ({ animation: { ...s.animation, ...patch } })),
  loadAnimation: (a) => set(() => ({ animation: a })),
  clear: () => set(() => ({ animation: createInitialAnimation() })),
}));
