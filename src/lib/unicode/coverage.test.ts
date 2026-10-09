import { describe, it, expect } from "vitest";
import { PLATFORMS, platformsFor, portabilityNote, groupByPortability } from "./coverage";

const ids = (cp: number) => platformsFor(cp).map((p) => p.id);

describe("coverage", () => {
  it("lists the measured platforms in display order", () => {
    expect(PLATFORMS.map((p) => p.id)).toEqual(["macos", "android"]);
  });

  it("knows which platforms draw a glyph", () => {
    expect(ids(0x41)).toEqual(["macos", "android"]); // A
    expect(ids(0x1f785)).toEqual([]); // 🞅 — only LastResort boxes on macOS
    expect(ids(0x1fbc5)).toEqual([]); // 🯅 stick figure
  });

  it("describes portability in words", () => {
    expect(portabilityNote(0x41)).toBe("built into macOS and Android");
    expect(portabilityNote(0x1f785)).toBe("no built-in font on macOS or Android");
  });

  it("groups safest first and keeps codepoint order within a section", () => {
    const sections = groupByPortability([0x1f785, 0x42, 0x1f786, 0x41]);
    expect(sections.map((s) => s.key)).toEqual(["macos+android", "none"]);
    expect(sections[0].cps).toEqual([0x42, 0x41]);
    expect(sections[1].cps).toEqual([0x1f785, 0x1f786]);
    expect(sections[0].label).toMatch(/^Safest/);
  });
});
