"use client";
import { EXAMPLES, type Example } from "@/data/presets";
import { useAnimation } from "@/store/animation";
import { useLoopPlayer } from "@/components/Stage/useLoopPlayer";
import { GLYPH_FONT_STACK } from "@/lib/fonts";
import styles from "./ExampleStrip.module.css";

// Every example playing at once, as a row of tiny loops. Click one to load it.
export function ExampleStrip() {
  return (
    <ul className={styles.strip} aria-label="Examples">
      {EXAMPLES.map((ex) => (
        <li key={ex.id}>
          <MiniLoop example={ex} />
        </li>
      ))}
    </ul>
  );
}

function MiniLoop({ example }: { example: Example }) {
  const loadAnimation = useAnimation((s) => s.loadAnimation);
  const { frames, speedMs, ink } = example.animation;
  const { index } = useLoopPlayer(frames, speedMs, true);
  const frame = frames[index] ?? frames[0];
  return (
    <button
      className={styles.tile}
      title={`${example.name}: ${example.description ?? ""}`}
      aria-label={`Load ${example.name}`}
      onClick={() => loadAnimation(structuredClone(example.animation))}
    >
      <span className={styles.g} style={{ color: frame.color ?? ink, fontFamily: GLYPH_FONT_STACK }} aria-hidden="true">
        {String.fromCodePoint(frame.cp)}
      </span>
    </button>
  );
}
