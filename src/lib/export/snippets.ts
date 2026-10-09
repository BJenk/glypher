import type { Animation } from "../../store/animation";

// "Use it" hands out data, not code: a component tag and the loop's frames.
// Everything here is escaped for where it lands, and timings are numbers.

export const PACKAGE = "@be_jenky/glypher";
export const CDN_SRC = "https://cdn.jsdelivr.net/npm/@be_jenky/glypher@0/dist/element.js";

const BLANK = "⠀"; // BRAILLE PATTERN BLANK: draws nothing, but isn't whitespace
// Missing before Firefox 125; without it, frames are always space-separated.
const segmenter =
  typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const JSX_SAFE = /^[^"&{}<>\\]*$/;

// The frames as one string the runtime splits back into the same frames: one
// glyph per frame when that round-trips (e.g. no combining marks merging into
// their neighbor), otherwise space-separated.
export function framesText(a: Animation): string {
  const frames = a.frames.map((f) => {
    const glyph = String.fromCodePoint(f.cp);
    return glyph.trim() === "" ? BLANK : glyph;
  });
  if (!segmenter) return frames.join(" ");
  const joined = frames.join("");
  const split = Array.from(segmenter.segment(joined), (s) => s.segment);
  const roundTrips = split.length === frames.length && split.every((s, i) => s === frames[i]);
  return roundTrips ? joined : frames.join(" ");
}

const ms = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? Math.round(n) : 150);

function timing(a: Animation): { speed: number; durations: number[] | null } {
  const speed = ms(a.speedMs);
  const durations = a.frames.map((f) => ms(f.durationMs ?? a.speedMs));
  return { speed, durations: durations.every((d) => d === speed) ? null : durations };
}

const html = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function reactProps(a: Animation): string {
  const text = framesText(a);
  const { speed, durations } = timing(a);
  const props = [JSX_SAFE.test(text) ? `frames="${text}"` : `frames={${JSON.stringify(text)}}`, `speed={${speed}}`];
  if (durations) props.push(`durations={[${durations.join(", ")}]}`);
  return props.join(" ");
}

function htmlAttrs(a: Animation): string {
  const { speed, durations } = timing(a);
  const attrs = [`frames="${html(framesText(a))}"`, `speed="${speed}"`];
  if (durations) attrs.push(`durations="${durations.join(",")}"`);
  return attrs.join(" ");
}

export const reactLoopSnippet = (a: Animation) =>
  `import { GlyphLoop } from "${PACKAGE}";\n\n<GlyphLoop ${reactProps(a)} />`;

export const reactFaviconSnippet = (a: Animation) =>
  `import { GlyphFavicon } from "${PACKAGE}";\n\n<GlyphFavicon ${reactProps(a)} />`;

export const htmlLoopSnippet = (a: Animation) =>
  `<script type="module" src="${CDN_SRC}"></script>\n\n<glyph-loop ${htmlAttrs(a)}></glyph-loop>`;

// The element goes in <body>: browsers end <head> at the first unknown
// element, which would push the rest of the head (title, meta) into the body.
export const htmlFaviconSnippet = (a: Animation) =>
  `<!-- In <head>: -->\n<script type="module" src="${CDN_SRC}"></script>\n\n` +
  `<!-- Anywhere in <body>: -->\n<glyph-favicon ${htmlAttrs(a)}></glyph-favicon>`;
