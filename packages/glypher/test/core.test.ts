import { describe, it, expect } from "vitest";
import {
  splitGlyphs, clampMs, normalizeLoop, parseDurations,
  DEFAULT_SPEED, MIN_MS, MAX_MS, MAX_FRAMES,
} from "../src/core";

describe("splitGlyphs", () => {
  it("makes one frame per glyph", () => {
    expect(splitGlyphs("✎✏✐✏")).toEqual(["✎", "✏", "✐", "✏"]);
  });
  it("keeps emoji sequences whole", () => {
    expect(splitGlyphs("👨‍👩‍👧🇯🇵👍🏽❤️")).toEqual(["👨‍👩‍👧", "🇯🇵", "👍🏽", "❤️"]);
  });
  it("keeps astral glyphs whole", () => {
    expect(splitGlyphs("𐧒𐧓")).toEqual(["𐧒", "𐧓"]);
  });
  it("splits on whitespace when there is any, so a frame can be several characters", () => {
    expect(splitGlyphs(" ab  c\nd ")).toEqual(["ab", "c", "d"]);
  });
  it("gives no frames for empty or blank text", () => {
    expect(splitGlyphs("")).toEqual([]);
    expect(splitGlyphs("  ")).toEqual([]);
  });
});

describe("clampMs", () => {
  it("rounds and clamps numbers", () => {
    expect(clampMs(99.6, 1)).toBe(100);
    expect(clampMs(1, 150)).toBe(MIN_MS);
    expect(clampMs(-5, 150)).toBe(MIN_MS);
    expect(clampMs(1e9, 150)).toBe(MAX_MS);
  });
  it("accepts numeric strings, as HTML attributes are", () => {
    expect(clampMs(" 200 ", 150)).toBe(200);
  });
  it("falls back for anything else", () => {
    for (const v of [NaN, Infinity, "", "fast", null, undefined, {}, [], "0]; alert(1)"]) {
      expect(clampMs(v, 150)).toBe(150);
    }
  });
});

describe("normalizeLoop", () => {
  it("gives every frame the speed by default", () => {
    expect(normalizeLoop({ frames: "ab" })).toEqual({ frames: ["a", "b"], durations: [DEFAULT_SPEED, DEFAULT_SPEED] });
  });
  it("uses per-frame durations where they're valid", () => {
    expect(normalizeLoop({ frames: "abc", speed: 100, durations: [50, NaN] }).durations).toEqual([50, 100, 100]);
  });
  it("keeps array frames as given, blanks included, paired with their durations", () => {
    const frames = ["a", " ", "", 5 as unknown as string, "bc"];
    expect(normalizeLoop({ frames, durations: [10, 20, 30, 40, 50] })).toEqual({
      frames: ["a", " ", "bc"],
      durations: [MIN_MS, 20, 50],
    });
  });
  it("drops frames longer than 16 code units", () => {
    expect(normalizeLoop({ frames: ["a".repeat(17), "b"] }).frames).toEqual(["b"]);
  });
  it("caps the frame count", () => {
    expect(normalizeLoop({ frames: "x".repeat(200) }).frames).toHaveLength(MAX_FRAMES);
  });
  it("ignores frames that aren't a string or an array", () => {
    expect(normalizeLoop({ frames: 42 as unknown as string })).toEqual({ frames: [], durations: [] });
  });
});

describe("parseDurations", () => {
  it("reads a comma list, leaving gaps unusable", () => {
    expect(parseDurations("100, ,400")).toEqual([100, NaN, 400]);
  });
  it("handles a missing attribute", () => {
    expect(parseDurations(null)).toEqual([]);
  });
});
