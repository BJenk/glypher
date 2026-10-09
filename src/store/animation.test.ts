import { describe, it, expect, beforeEach } from "vitest";
import { useAnimation, createInitialAnimation, MAX_FRAMES } from "./animation";

beforeEach(() => useAnimation.getState().clear());

describe("animation store", () => {
  it("adds frames with unique ids and the given codepoint", () => {
    useAnimation.getState().addFrame(0x3a8);
    useAnimation.getState().addFrame(0x1200);
    const f = useAnimation.getState().animation.frames;
    expect(f.map((x) => x.cp)).toEqual([0x3a8, 0x1200]);
    expect(new Set(f.map((x) => x.id)).size).toBe(2);
  });

  it("removes frames", () => {
    const s = useAnimation.getState();
    s.addFrame(1);
    const id = useAnimation.getState().animation.frames[0].id;
    s.removeFrame(id);
    expect(useAnimation.getState().animation.frames).toHaveLength(0);
  });

  it("reorders a frame from one index to another (drag-and-drop)", () => {
    const s = useAnimation.getState();
    s.addFrame(1); s.addFrame(2); s.addFrame(3);
    // move the first frame (cp 1) to the end
    s.reorderFrame(0, 2);
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual([2, 3, 1]);
    // move it back to the front
    s.reorderFrame(2, 0);
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual([1, 2, 3]);
    // out-of-range / no-op is ignored
    s.reorderFrame(0, 9);
    s.reorderFrame(1, 1);
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual([1, 2, 3]);
  });

  it("sets globals and loads a whole animation", () => {
    useAnimation.getState().setGlobal({ speedMs: 120 });
    expect(useAnimation.getState().animation.speedMs).toBe(120);
    const a = createInitialAnimation();
    a.frames.push({ id: "x", cp: 65 });
    useAnimation.getState().loadAnimation(a);
    expect(useAnimation.getState().animation.frames[0].cp).toBe(65);
  });

  it("stops adding frames at the runtime's limit", () => {
    expect(MAX_FRAMES).toBe(64);
    for (let i = 0; i < MAX_FRAMES + 5; i++) useAnimation.getState().addFrame(65);
    expect(useAnimation.getState().animation.frames).toHaveLength(MAX_FRAMES);
  });
});
