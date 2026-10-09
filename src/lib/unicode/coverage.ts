import coverageData from "./generated/coverage.json";

// Which operating systems can show a glyph with the fonts they ship. Built from
// measured font coverage (scripts/coverage/ → vendor/coverage/ → the unicode
// build), so a glyph counts as "built in" only if a stock install draws it.

export type Platform = { id: string; name: string; source: string; fonts: number; measured: string };

type CoverageData = { platforms: Platform[]; ranges: Record<string, [number, number][]> };
const DATA = coverageData as unknown as CoverageData;

export const PLATFORMS: Platform[] = DATA.platforms;

function inRanges(ranges: [number, number][], cp: number): boolean {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [start, end] = ranges[mid];
    if (cp < start) hi = mid - 1;
    else if (cp > end) lo = mid + 1;
    else return true;
  }
  return false;
}

// Platforms whose built-in fonts cover cp, in PLATFORMS order.
export function platformsFor(cp: number): Platform[] {
  return PLATFORMS.filter((p) => inRanges(DATA.ranges[p.id] ?? [], cp));
}

// False when no measured platform has a built-in font for cp: such glyphs show
// as empty boxes almost anywhere they're pasted, so the picker leaves them out.
export function isPortable(cp: number): boolean {
  return PLATFORMS.length === 0 || platformsFor(cp).length > 0;
}

export function namesList(platforms: Platform[], conjunction: "and" | "or" = "and"): string {
  const names = platforms.map((p) => p.name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${conjunction} ${names[names.length - 1]}`;
}

// One-line portability note for tooltips and labels.
export function portabilityNote(cp: number): string {
  const on = platformsFor(cp);
  if (PLATFORMS.length === 0) return "";
  if (on.length === PLATFORMS.length) return `built into ${namesList(on)}`;
  if (on.length === 0) return `no built-in font on ${namesList(PLATFORMS, "or")}`;
  return `built into ${namesList(on)} only`;
}

export type PortabilitySection = {
  key: string;
  platforms: Platform[];
  // 0 = covered everywhere measured; higher = fewer platforms.
  rank: number;
  label: string;
  cps: number[];
};

function sectionLabel(on: Platform[]): string {
  if (on.length === PLATFORMS.length) return `Safest: built into ${namesList(on)}`;
  if (on.length === 0) return `No built-in font on ${namesList(PLATFORMS, "or")}`;
  return `${namesList(on)} only`;
}

// Group codepoints by exactly which platforms cover them. Sections run from the
// safest (every platform) down to none; sections covering the same number of
// platforms are ordered largest first. Codepoint order is kept within each.
export function groupByPortability(cps: number[]): PortabilitySection[] {
  const byKey = new Map<string, PortabilitySection>();
  for (const cp of cps) {
    const on = platformsFor(cp);
    const key = on.map((p) => p.id).join("+") || "none";
    let section = byKey.get(key);
    if (!section) {
      section = { key, platforms: on, rank: PLATFORMS.length - on.length, label: sectionLabel(on), cps: [] };
      byKey.set(key, section);
    }
    section.cps.push(cp);
  }
  return [...byKey.values()].sort((a, b) => a.rank - b.rank || b.cps.length - a.cps.length);
}
