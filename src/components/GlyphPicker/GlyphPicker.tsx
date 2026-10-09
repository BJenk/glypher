"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { search, allCodepoints, nameOf } from "../../lib/unicode/index";
import { groupByPortability, isPortable, portabilityNote } from "../../lib/unicode/coverage";
import { useAnimation } from "../../store/animation";
import { GLYPH_FONT_STACK } from "../../lib/fonts";
import styles from "./GlyphPicker.module.css";

const CELL = 42; // px — cell footprint (also the height of a row of cells)
const HEADER = 34; // px — section header row height
const VIEWPORT = 440; // px — scroll viewport height
const OVERSCAN = 4; // extra rows rendered above/below the viewport

type Row =
  | { kind: "header"; key: string; label: string; count: number; top: number }
  | { kind: "cells"; key: string; cps: number[]; top: number };

// Lay sections out as rows: a header, then the section's glyphs in rows of
// `cols`. Each row records its pixel offset so the window can find it.
function layoutRows(sections: ReturnType<typeof groupByPortability>, cols: number) {
  const rows: Row[] = [];
  let top = 0;
  for (const s of sections) {
    rows.push({ kind: "header", key: `h-${s.key}`, label: s.label, count: s.cps.length, top });
    top += HEADER;
    for (let i = 0; i < s.cps.length; i += cols) {
      rows.push({ kind: "cells", key: `${s.key}-${i}`, cps: s.cps.slice(i, i + cols), top });
      top += CELL;
    }
  }
  return { rows, height: top };
}

// Index of the last row starting at or above y.
function rowAt(rows: Row[], y: number): number {
  let lo = 0;
  let hi = rows.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (rows[mid].top <= y) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// A dependency-free windowed grid: only the visible rows are rendered, so the
// full ~40k-glyph list scrolls smoothly. Glyphs are grouped by how many
// operating systems can show them, safest first. Search filters the same list.
export function GlyphPicker() {
  const addFrame = useAnimation((s) => s.addFrame);
  const [query, setQuery] = useState("");
  const [cols, setCols] = useState(12);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => {
    const q = query.trim();
    const cps = q ? search(q, 2000).map((r) => r.cp) : allCodepoints();
    return groupByPortability(cps.filter(isPortable));
  }, [query]);
  const { rows, height } = useMemo(() => layoutRows(sections, cols), [sections, cols]);

  // Measure how many columns fit; guarded so it degrades gracefully without
  // layout (jsdom / SSR) to the default column count.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setCols(Math.max(1, Math.floor(w / CELL)));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const first = rows.length ? rowAt(rows, scrollTop) : 0;
  const visible = rows.slice(Math.max(0, first - OVERSCAN), rowAt(rows, scrollTop + VIEWPORT) + OVERSCAN + 1);

  // The pinned header: the section the top of the viewport is in. As the next
  // section's header scrolls up into it, it pushes the pinned one out.
  const headers = rows.filter((r): r is Extract<Row, { kind: "header" }> => r.kind === "header");
  let current = -1;
  for (let i = 0; i < headers.length && headers[i].top <= scrollTop; i++) current = i;
  const pinned = current >= 0 && scrollTop > 0 ? headers[current] : null;
  const next = headers[current + 1];
  const pinnedOffset = next ? Math.min(0, next.top - scrollTop - HEADER) : 0;

  return (
    <div>
      <input
        className={styles.input}
        placeholder="Search by name, U+code, or paste a character"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setScrollTop(0);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }}
      />
      <div
        ref={scrollRef}
        className={styles.scroll}
        style={{ height: VIEWPORT }}
        onScroll={(e) => setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
      >
        {rows.length === 0 ? (
          <div className={styles.empty}>no glyphs match</div>
        ) : (
          <>
            {pinned && (
              <div className={styles.pin} aria-hidden="true">
                <div className={styles.header} style={{ top: pinnedOffset, height: HEADER }}>
                  <span>{pinned.label}</span>
                  <span className={styles.count}>{pinned.count.toLocaleString("en-US")}</span>
                </div>
              </div>
            )}
            <div style={{ height, position: "relative" }}>
              {visible.map((row) =>
                row.kind === "header" ? (
                  <div key={row.key} className={styles.header} style={{ top: row.top, height: HEADER }}>
                    <span>{row.label}</span>
                    <span className={styles.count}>{row.count.toLocaleString("en-US")}</span>
                  </div>
                ) : (
                  <div
                    key={row.key}
                    className={styles.rowset}
                    style={{ top: row.top, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: `${CELL}px` }}
                  >
                    {row.cps.map((cp) => {
                      const name = nameOf(cp) ?? `U+${cp.toString(16).toUpperCase()}`;
                      const hex = cp.toString(16).toUpperCase().padStart(4, "0");
                      const note = portabilityNote(cp);
                      return (
                        <button
                          key={cp}
                          className={styles.cell}
                          title={`${name} · U+${hex}${note ? ` · ${note}` : ""}`}
                          aria-label={`add ${name}${note ? ` (${note})` : ""}`}
                          onClick={() => addFrame(cp)}
                        >
                          <span className={styles.g} style={{ fontFamily: GLYPH_FONT_STACK }}>
                            {String.fromCodePoint(cp)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
