"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Animation } from "@/store/animation";
import { GLYPH_FONT_STACK } from "@/lib/fonts";
import { EXPORT_MODES, type ExportMode, type Target } from "./targets";
import styles from "./ExportDialog.module.css";

// "Get code": a popup that asks where the loop should play (in the page or in
// the browser tab), then gives copyable code for the chosen framework.
export function ExportDialog({ animation, className }: { animation: Animation; className?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [modeId, setModeId] = useState(EXPORT_MODES[0].id);
  const [targetId, setTargetId] = useState(EXPORT_MODES[0].targets[0].id);
  const [copied, setCopied] = useState(false);
  const copyRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const mode = EXPORT_MODES.find((m) => m.id === modeId) ?? EXPORT_MODES[0];
  // Keep the framework when switching modes, if the new mode has it.
  const target = mode.targets.find((t) => t.id === targetId) ?? mode.targets[0];
  const code = open ? target.generate(animation) : "";
  const tabId = (t: Target) => `${id}-tab-${t.id}`;
  const firstGlyph = animation.frames[0] ? String.fromCodePoint(animation.frames[0].cp) : "";

  useEffect(() => {
    if (!open) return;
    copyRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setCopied(false);
    opener.current?.focus();
  }

  function chooseMode(m: ExportMode) {
    setModeId(m.id);
    setCopied(false);
  }

  function chooseTarget(next: string) {
    setTargetId(next);
    setCopied(false);
  }

  // Arrow keys move between tabs, as in a native tab strip.
  function onTabKey(e: React.KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = mode.targets[(i + step + mode.targets.length) % mode.targets.length];
    chooseTarget(next.id);
    document.getElementById(tabId(next))?.focus();
  }

  async function copy() {
    if (typeof navigator.clipboard === "undefined") return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <button ref={opener} className={className} onClick={() => setOpen(true)} disabled={animation.frames.length === 0}>
        Get code
      </button>
      {open && (
        <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
            <header className={styles.head}>
              <h2 id={`${id}-title`} className={styles.title}>Get code</h2>
              <button className={styles.close} onClick={close} aria-label="Close">✕</button>
            </header>

            <div className={styles.modes} role="radiogroup" aria-label="Where should the loop play?">
              {EXPORT_MODES.map((m) => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={m.id === mode.id}
                  className={styles.mode}
                  onClick={() => chooseMode(m)}
                >
                  <span className={styles.modePreview} aria-hidden="true">
                    {m.id === "tab" ? (
                      <span className={styles.miniTab}>
                        <span className={styles.miniIcon} style={{ fontFamily: GLYPH_FONT_STACK }}>{firstGlyph}</span>
                        Your site
                      </span>
                    ) : (
                      <span className={styles.miniPage}>
                        <span style={{ fontFamily: GLYPH_FONT_STACK }}>{firstGlyph}</span> Loading…
                      </span>
                    )}
                  </span>
                  <span className={styles.modeLabel}>{m.label}</span>
                  <span className={styles.modeText}>{m.description}</span>
                </button>
              ))}
            </div>

            <div className={styles.tabs} role="tablist" aria-label="Framework">
              {mode.targets.map((t, i) => (
                <button
                  key={t.id}
                  id={tabId(t)}
                  role="tab"
                  aria-selected={t.id === target.id}
                  aria-controls={`${id}-panel`}
                  tabIndex={t.id === target.id ? 0 : -1}
                  className={styles.tab}
                  onClick={() => chooseTarget(t.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div id={`${id}-panel`} role="tabpanel" aria-labelledby={tabId(target)}>
              <p className={styles.text}>
                {mode.summary} {target.intro}
              </p>

              <div className={styles.codeBlock}>
                <div className={styles.codeBar}>
                  <span>{target.file}</span>
                  <button ref={copyRef} className={styles.copy} onClick={copy}>
                    {copied ? "Copied" : "Copy code"}
                  </button>
                </div>
                {/* Focusable so keyboard users can scroll it. */}
                <pre className={styles.scroll} data-testid="export-code" tabIndex={0} aria-label={`${target.label} code`}>
                  {code}
                </pre>
              </div>

              <h3 className={styles.subhead}>{target.placementTitle ?? "Where it goes"}</h3>
              <pre className={styles.code}>{target.placement}</pre>
              <ul className={styles.notes}>
                {target.tip && <li>{target.tip}</li>}
                {mode.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
