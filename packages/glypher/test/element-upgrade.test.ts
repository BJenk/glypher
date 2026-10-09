import { describe, it, expect, vi, afterEach } from "vitest";
import { stubCanvas } from "./canvas";

// The CDN path: the page's markup is parsed before the module script defines
// the elements, so they're upgraded in place with their attributes already set.
// This file imports the element module itself, after the markup exists.
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("upgrading elements already in the page", () => {
  it("starts each element once", async () => {
    const ctx = stubCanvas();
    const draw = vi.spyOn(ctx, "fillText");
    document.body.innerHTML =
      '<glyph-favicon frames="abc" speed="100" durations="100,100,100" font="x"></glyph-favicon>' +
      '<glyph-loop frames="xyz" speed="100" durations="100,100,100" label="Saving"></glyph-loop>';
    await import("../src/element");
    expect(draw).toHaveBeenCalledTimes(3);
    const loop = document.querySelector("glyph-loop")!;
    expect(loop.shadowRoot!.querySelectorAll("span")).toHaveLength(3);
    expect(loop.getAttribute("aria-label")).toBe("Saving");
  });
});
