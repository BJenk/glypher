import { describe, it, expect } from "vitest";
import { GERMINATION } from "./germination";
import { isPortable } from "@/lib/unicode/coverage";

describe("germination preset", () => {
  it("is a valid v1 looping animation with frames", () => {
    expect(GERMINATION.version).toBe(1);
    expect(GERMINATION.loop).toBe(true);
    expect(GERMINATION.frames.length).toBeGreaterThan(5);
  });
  it("uses only glyphs a measured platform can draw", () => {
    for (const f of GERMINATION.frames) expect(isPortable(f.cp)).toBe(true);
  });
});
