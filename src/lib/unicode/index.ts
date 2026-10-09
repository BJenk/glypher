import namesData from "./generated/names.json";

type Pair = [number, string];
const PAIRS = namesData as Pair[];
const NAME_BY_CP = new Map<number, string>(PAIRS);

export function nameOf(cp: number): string | undefined {
  return NAME_BY_CP.get(cp);
}

let allCps: number[] | null = null;
// Every named codepoint, ascending — the full browse list for the picker.
export function allCodepoints(): number[] {
  if (!allCps) allCps = PAIRS.map(([cp]) => cp);
  return allCps;
}

function parseCodepoint(q: string): number | undefined {
  const t = q.trim();
  let m = t.match(/^[uU]\+([0-9a-fA-F]{1,6})$/) || t.match(/^0x([0-9a-fA-F]{1,6})$/);
  if (m) return parseInt(m[1], 16);
  if (/^[0-9]{1,7}$/.test(t)) return parseInt(t, 10);
  if ([...t].length === 1) return t.codePointAt(0);
  return undefined;
}

export function search(query: string, limit = 200): { cp: number; name: string }[] {
  const q = query.trim();
  if (!q) return [];
  const direct = parseCodepoint(q);
  if (direct !== undefined && NAME_BY_CP.has(direct)) {
    return [{ cp: direct, name: NAME_BY_CP.get(direct)! }];
  }
  const tokens = q.toUpperCase().split(/\s+/).filter(Boolean);
  const out: { cp: number; name: string }[] = [];
  for (const [cp, name] of PAIRS) {
    if (tokens.every((t) => name.includes(t))) {
      out.push({ cp, name });
      if (out.length >= limit) break;
    }
  }
  return out;
}
