import { describe, it, expect } from "vitest";
import { parseUnicodeData, buildCoverage } from "../build-unicode-index.mjs";

describe("parseUnicodeData", () => {
  it("extracts [codepoint, name] pairs and skips <control> ranges", () => {
    const txt = [
      "0041;LATIN CAPITAL LETTER A;Lu;0;L;;;;;N;;;;0061;",
      "03A8;GREEK CAPITAL LETTER PSI;Lu;0;L;;;;;N;;;;03C8;",
      "0000;<control>;Cc;0;BN;;;;;N;NULL;;;;",
    ].join("\n");
    expect(parseUnicodeData(txt)).toEqual([
      [0x41, "LATIN CAPITAL LETTER A"],
      [0x3a8, "GREEK CAPITAL LETTER PSI"],
    ]);
  });
});

describe("buildCoverage", () => {
  it("keeps only named codepoints and merges runs across unnamed gaps", () => {
    const names = [[0x41, "A"], [0x42, "B"], [0x50, "P"], [0x60, "BACKTICK-ISH"]];
    const platforms = [
      { id: "macos", name: "macOS", source: "test", fonts: 1, measured: "2026-10-08", ranges: [[0x40, 0x42], [0x50, 0x50]] },
    ];
    const out = buildCoverage(names, platforms);
    expect(out.platforms).toEqual([{ id: "macos", name: "macOS", source: "test", fonts: 1, measured: "2026-10-08" }]);
    // 0x41, 0x42, 0x50 are consecutive among named codepoints; 0x60 is uncovered.
    expect(out.ranges.macos).toEqual([[0x41, 0x50]]);
  });
});
