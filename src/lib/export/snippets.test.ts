import { describe, it, expect } from "vitest";
import {
  CDN_SRC, framesText, reactLoopSnippet, reactFaviconSnippet, htmlLoopSnippet, htmlFaviconSnippet,
} from "./snippets";
import { splitGlyphs } from "../../../packages/glypher/src/core";
import type { Animation } from "../../store/animation";

const anim = (cps: number[], extra: Partial<Animation> = {}, durations: (number | undefined)[] = []): Animation => ({
  version: 1, loop: true, speedMs: 150, background: "#ffffff", ink: "#111111",
  frames: cps.map((cp, i) => (durations[i] === undefined ? { id: `f${i}`, cp } : { id: `f${i}`, cp, durationMs: durations[i] })),
  ...extra,
});
const glyphs = (a: Animation) => a.frames.map((f) => String.fromCodePoint(f.cp));

describe("framesText", () => {
  it("joins single glyphs", () => {
    expect(framesText(anim([0x270e, 0x270f]))).toBe("✎✏");
  });
  it.each([
    ["combining marks", [0x65, 0x301, 0x61]],
    ["regional indicators that would pair into a flag", [0x1f1ef, 0x1f1f5, 0x1f1ef]],
    ["an emoji and a separate skin-tone frame", [0x1f44d, 0x1f3fd]],
    ["astral glyphs", [0x109d2, 0x109d3]],
  ])("round-trips %s through the runtime's splitting", (_, cps) => {
    const a = anim(cps);
    expect(splitGlyphs(framesText(a))).toEqual(glyphs(a));
  });
  it("swaps blank frames for a blank the runtime keeps", () => {
    expect(splitGlyphs(framesText(anim([0x41, 0x20, 0x42])))).toEqual(["A", "⠀", "B"]);
  });
});

describe("React snippets", () => {
  it("import the component and pass the loop as props", () => {
    expect(reactLoopSnippet(anim([0x270e, 0x270f]))).toBe(
      'import { GlyphLoop } from "@bjenk/glypher";\n\n<GlyphLoop frames="✎✏" speed={150} />',
    );
  });
  it("add durations only when frames differ", () => {
    expect(reactLoopSnippet(anim([0x41, 0x42]))).not.toContain("durations");
    expect(reactLoopSnippet(anim([0x41, 0x42], {}, [undefined, 400]))).toContain("durations={[150, 400]}");
  });
  it("fall back to a JS string when frames would break the attribute", () => {
    expect(reactLoopSnippet(anim([0x22, 0x7b, 0x3c, 0x26]))).toContain('frames={"\\"{<&"}');
  });
  it("use GlyphFavicon for the tab", () => {
    expect(reactFaviconSnippet(anim([0x41]))).toBe(
      'import { GlyphFavicon } from "@bjenk/glypher";\n\n<GlyphFavicon frames="A" speed={150} />',
    );
  });
});

describe("HTML snippets", () => {
  it("load the element from the CDN and set attributes", () => {
    expect(htmlLoopSnippet(anim([0x270e, 0x270f]))).toBe(
      `<script type="module" src="${CDN_SRC}"></script>\n\n<glyph-loop frames="✎✏" speed="150"></glyph-loop>`,
    );
  });
  it("escape markup in frames", () => {
    expect(htmlLoopSnippet(anim([0x22, 0x3c, 0x26, 0x3e]))).toContain('frames="&quot;&lt;&amp;&gt;"');
  });
  it("write durations as a list", () => {
    expect(htmlFaviconSnippet(anim([0x41, 0x42], {}, [100, 400]))).toContain(
      '<glyph-favicon frames="AB" speed="150" durations="100,400"></glyph-favicon>',
    );
  });
  it("place the favicon element in <body>, since an unknown element in <head> ends the head", () => {
    expect(htmlFaviconSnippet(anim([0x41]))).toBe(
      `<!-- In <head>: -->\n<script type="module" src="${CDN_SRC}"></script>\n\n` +
        `<!-- Anywhere in <body>: -->\n<glyph-favicon frames="A" speed="150"></glyph-favicon>`,
    );
  });
  it("keep timings numeric even if the animation isn't", () => {
    const a = anim([0x41, 0x42], { speedMs: "1); alert(1" as unknown as number });
    expect(htmlLoopSnippet(a)).not.toContain("alert");
    expect(reactLoopSnippet(a)).not.toContain("alert");
  });
});
