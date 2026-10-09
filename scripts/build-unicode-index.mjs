import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function parseUnicodeData(txt) {
  const out = [];
  for (const line of txt.split("\n")) {
    if (!line) continue;
    const f = line.split(";");
    const name = f[1];
    if (!name || name.startsWith("<")) continue; // skip control/range markers
    out.push([parseInt(f[0], 16), name]);
  }
  return out;
}

// Fold per-platform font coverage (vendor/coverage/*.json, [start, end] ranges
// from scripts/coverage/) down to the named codepoints the picker shows. Runs
// of named codepoints a platform covers merge across unnamed gaps, which keeps
// the shipped ranges small.
export function buildCoverage(names, platforms) {
  const cps = names.map(([cp]) => cp);
  const ranges = {};
  for (const p of platforms) {
    const out = [];
    let r = 0;
    let open = null;
    for (const cp of cps) {
      while (r < p.ranges.length && p.ranges[r][1] < cp) r++;
      const covered = r < p.ranges.length && p.ranges[r][0] <= cp;
      if (covered) {
        if (open) open[1] = cp;
        else out.push((open = [cp, cp]));
      } else {
        open = null;
      }
    }
    ranges[p.id] = out;
  }
  return {
    platforms: platforms.map(({ id, name, source, fonts, measured }) => ({ id, name, source, fonts, measured })),
    ranges,
  };
}

// Display order for platforms, whatever order the files are read in.
const PLATFORM_ORDER = ["macos", "windows", "android"];

function readPlatforms(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(resolve(dir, f), "utf8")))
    .sort((a, b) => PLATFORM_ORDER.indexOf(a.id) - PLATFORM_ORDER.indexOf(b.id));
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, "../src/lib/unicode/generated");
  mkdirSync(outDir, { recursive: true });
  const names = parseUnicodeData(readFileSync(resolve(here, "../vendor/ucd/UnicodeData.txt"), "utf8"));
  writeFileSync(resolve(outDir, "names.json"), JSON.stringify(names));
  const coverage = buildCoverage(names, readPlatforms(resolve(here, "../vendor/coverage")));
  writeFileSync(resolve(outDir, "coverage.json"), JSON.stringify(coverage));
  const measured = coverage.platforms.map((p) => p.name).join(", ") || "none";
  console.log(`wrote ${names.length} names, coverage for ${measured}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
