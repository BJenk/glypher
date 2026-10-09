"use client";
import { useEffect } from "react";
import { useAnimation } from "@/store/animation";
import { decodeAnimation } from "@/lib/share/encode";
import { saveLocal, loadLocal } from "@/lib/persist/local";
import { GlyphPicker } from "./GlyphPicker/GlyphPicker";
import { Timeline } from "./Timeline/Timeline";
import { Stage } from "./Stage/Stage";
import { ExampleStrip } from "./ExampleStrip/ExampleStrip";
import { GlyphTitle } from "./GlyphTitle/GlyphTitle";
import styles from "./App.module.css";

export function App() {
  const { animation, loadAnimation } = useAnimation();

  // hydrate once on mount: URL hash wins, else localStorage
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const fromUrl = hash ? decodeAnimation(hash) : null;
    if (fromUrl) { loadAnimation(fromUrl); return; }
    const fromLocal = loadLocal();
    if (fromLocal) loadAnimation(fromLocal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autosave
  useEffect(() => { saveLocal(animation); }, [animation]);

  return (
    <main className={styles.wrap}>
      <header className={styles.masthead}>
        <div>
          <GlyphTitle className={styles.title} />
        </div>
        <ExampleStrip />
      </header>
      <Stage>
        <Timeline />
      </Stage>
      <section className={styles.section} aria-label="Glyphs">
        <GlyphPicker />
      </section>
    </main>
  );
}
