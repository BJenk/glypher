"use client";
import { useState } from "react";
import { GlyphFavicon } from "@be_jenky/glypher";
import { useAnimation } from "../../store/animation";
import { ExportDialog } from "../ExportDialog/ExportDialog";
import { useLoopPlayer } from "./useLoopPlayer";
import { GLYPH_FONT_STACK } from "../../lib/fonts";
import { PLATFORMS, platformsFor } from "../../lib/unicode/coverage";
import styles from "./Stage.module.css";

export function Stage({ children }: { children?: React.ReactNode }) {
  const { animation, setGlobal, clear } = useAnimation();
  const [playing, setPlaying] = useState(true);
  const { index } = useLoopPlayer(animation.frames, animation.speedMs, playing);
  const frame = animation.frames[index];
  const glyph = frame ? String.fromCodePoint(frame.cp) : "";
  const color = frame?.color ?? animation.ink;
  const [inTab, setInTab] = useState(true);
  // Per platform, the distinct glyphs in the sequence its built-in fonts can't draw.
  const distinct = [...new Set(animation.frames.map((f) => f.cp))];
  const missing = PLATFORMS.map((p) => ({
    platform: p,
    cps: distinct.filter((cp) => !platformsFor(cp).some((q) => q.id === p.id)),
  }));

  return (
    <div className={styles.bar}>
      {/* The same component users install, so the preview is what they get:
          drawn with the system font, as in their visitors' tabs. */}
      {inTab && (
        <GlyphFavicon
          frames={animation.frames.map((f) => String.fromCodePoint(f.cp))}
          speed={animation.speedMs}
          durations={animation.frames.map((f) => f.durationMs ?? animation.speedMs)}
          playing={playing}
        />
      )}
      <div className={styles.stage} style={{ background: animation.background }}>
        <span data-testid="stage-glyph" className={styles.glyph} style={{ color, fontFamily: GLYPH_FONT_STACK }}>
          {glyph}
        </span>
      </div>

      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.transport}>
            <button className={styles.button} onClick={() => setPlaying((p) => !p)}>
              {playing ? "❚❚ Pause" : "▶ Play"}
            </button>
            <label className={styles.speed}>
              Speed
              <input
                type="range" min={90} max={480} step={10}
                value={animation.speedMs}
                onChange={(e) => setGlobal({ speedMs: Number(e.target.value) })}
              />
              <span className={styles.value}>{animation.speedMs} ms</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={inTab} onChange={(e) => setInTab(e.target.checked)} />
              Show in browser tab
            </label>
          </div>
          <div className={styles.actions}>
            <ExportDialog animation={animation} className={styles.button} />
            <button className={styles.quiet} onClick={clear}>Clear</button>
          </div>
        </div>

        {animation.frames.length > 0 && (
          <>
            <span
              data-testid="stage-sequence"
              className={styles.sequenceText}
              style={{ fontFamily: GLYPH_FONT_STACK }}
            >
              {animation.frames.map((f) => (
                <span key={f.id} className={styles.sequenceChar}>{String.fromCodePoint(f.cp)}</span>
              ))}
            </span>
            {PLATFORMS.length > 0 && (
              <ul className={styles.portability} data-testid="stage-portability">
                {missing.map(({ platform, cps }) => (
                  <li
                    key={platform.id}
                    className={cps.length ? styles.missing : styles.ok}
                    title={`Checked against the fonts built into ${platform.source}`}
                  >
                    {cps.length === 0 ? (
                      <>✓ {platform.name}</>
                    ) : (
                      <>
                        ✕ {platform.name}: no font for{" "}
                        <span style={{ fontFamily: GLYPH_FONT_STACK }}>
                          {cps.map((cp) => String.fromCodePoint(cp)).join(" ")}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {children && <div className={styles.row}>{children}</div>}
    </div>
  );
}
