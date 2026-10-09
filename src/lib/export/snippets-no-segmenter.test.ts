import { describe, it, expect, vi, afterEach } from "vitest";
import type { Animation } from "../../store/animation";

// Firefox before 125 has no Intl.Segmenter; the editor must still load there.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("snippets without Intl.Segmenter", () => {
  it("load, and separate frames with spaces so they always split back the same", async () => {
    vi.stubGlobal("Intl", { ...Intl, Segmenter: undefined });
    vi.resetModules();
    const { framesText } = await import("./snippets");
    const a: Animation = {
      version: 1, loop: true, speedMs: 150, background: "#ffffff", ink: "#111111",
      frames: [{ id: "a", cp: 0x270e }, { id: "b", cp: 0x270f }],
    };
    expect(framesText(a)).toBe("✎ ✏");
  });
});
