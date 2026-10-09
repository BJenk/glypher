import { describe, it, expect } from "vitest";
import { nameOf, allCodepoints, search } from "./index";

describe("unicode lookup", () => {
  it("resolves names", () => {
    expect(nameOf(0x3a8)).toBe("GREEK CAPITAL LETTER PSI");
    expect(nameOf(0xe000)).toBeUndefined(); // private use: no name
  });
  it("lists every named codepoint in order", () => {
    const cps = allCodepoints();
    expect(cps).toContain(0x3a8);
    expect(cps).not.toContain(0xe000);
    expect(cps.every((cp, i) => i === 0 || cp > cps[i - 1])).toBe(true);
  });
});

describe("search", () => {
  it("finds by name token", () => {
    const r = search("psi", 50);
    expect(r.some((x) => x.cp === 0x3a8)).toBe(true);
  });
  it("finds by U+ codepoint", () => {
    expect(search("U+03A8")[0].cp).toBe(0x3a8);
  });
  it("finds by pasted character", () => {
    expect(search("Ψ")[0].cp).toBe(0x3a8);
  });
  it("respects the limit", () => {
    expect(search("letter", 5).length).toBeLessThanOrEqual(5);
  });
});
