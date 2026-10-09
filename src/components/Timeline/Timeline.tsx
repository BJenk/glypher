"use client";
import { useState } from "react";
import { useAnimation, MAX_FRAMES } from "../../store/animation";
import { GLYPH_FONT_STACK } from "../../lib/fonts";
import styles from "./Timeline.module.css";

export function Timeline() {
  const { animation, removeFrame, reorderFrame } = useAnimation();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (animation.frames.length === 0) {
    return <div className={styles.empty}>Pick glyphs below to build a loop. Drag cards to reorder.</div>;
  }

  function endDrag() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <>
      <div className={styles.seq}>
        {animation.frames.map((f, i) => {
          const cls =
            styles.card +
            (dragIndex === i ? " " + styles.dragging : "") +
            (overIndex === i && dragIndex !== null && dragIndex !== i ? " " + styles.dragover : "");
          return (
            <div
              key={f.id}
              className={cls}
              draggable
              title="drag to reorder"
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragEnd={endDrag}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) reorderFrame(dragIndex, i);
                endDrag();
              }}
            >
              <span className={styles.ix}>{i + 1}</span>
              <button
                className={styles.del}
                aria-label="✕"
                title="remove frame"
                draggable={false}
                onClick={() => removeFrame(f.id)}
              >
                ✕
              </button>
              <span className={styles.g} style={{ color: f.color ?? animation.ink, fontFamily: GLYPH_FONT_STACK }}>
                {String.fromCodePoint(f.cp)}
              </span>
              <span className={styles.grip} aria-hidden="true">⠿</span>
            </div>
          );
        })}
      </div>
      {animation.frames.length >= MAX_FRAMES && (
        <div className={styles.empty}>{MAX_FRAMES} frames is the most a loop can have.</div>
      )}
    </>
  );
}
