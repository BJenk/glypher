"use client";
import { useEffect, useState } from "react";
import { TITLE, TITLE_SPEED_MS, type TitleLetter } from "../../data/title";
import { GLYPH_FONT_STACK } from "../../lib/fonts";
import styles from "./GlyphTitle.module.css";

// The wordmark: each letter cycles through its lookalike glyphs. Screen readers
// get the plain word.
export function GlyphTitle({ className }: { className?: string }) {
  const word = TITLE.map((t) => t.letter).join("");
  return (
    <h1 className={className} aria-label={word}>
      {TITLE.map((t, i) => (
        <Letter key={i} entry={t} offset={i} />
      ))}
    </h1>
  );
}

function Letter({ entry, offset }: { entry: TitleLetter; offset: number }) {
  const frames = entry.frames.length ? entry.frames : [entry.letter];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (frames.length < 2) return;
    // Stagger letters so they don't all change on the same beat.
    let id: number | undefined;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => setIndex((i) => (i + 1) % frames.length), TITLE_SPEED_MS);
    }, offset * 90);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [frames.length, offset]);

  if (frames.length < 2) return <span aria-hidden="true">{entry.letter}</span>;
  // Every frame sits in the same grid cell, so the letter is as wide as its
  // widest frame and the word doesn't jitter as frames change.
  return (
    <span className={styles.letter} style={{ fontFamily: GLYPH_FONT_STACK }} aria-hidden="true">
      {frames.map((f, i) => (
        <span key={i} className={i === index ? styles.on : styles.off}>
          {f}
        </span>
      ))}
    </span>
  );
}
