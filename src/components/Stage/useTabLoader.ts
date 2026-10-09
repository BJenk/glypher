import { useEffect, useRef } from "react";
import { GLYPH_FONT_STACK } from "@/lib/fonts";

const SIZE = 64; // favicon canvas, px; browsers scale it down to 16–32px

export type TabFrame = { glyph: string; ms: number };

// Background tabs only let main-thread timers fire about once a second, at fixed
// wake-ups, so a loop driven from here stutters and drops frames once you tab
// away. Worker timers aren't held back like that, so while the page is hidden a
// tiny worker keeps the clock and the icon keeps its real speed.
const WORKER_SRC = "onmessage = (e) => setTimeout(() => postMessage(0), e.data);";

// Mirrors the playing loop into the browser tab's favicon. Pass null to stop;
// the original icon comes back. The title is left alone: tab titles use the
// system UI font, where glyphs like ✏ turn into color emoji or boxes.
export function useTabLoader(frames: TabFrame[] | null, index: number) {
  const original = useRef<{ icon: HTMLLinkElement | null; href: string | null } | null>(null);
  const ownIcon = useRef<HTMLLinkElement | null>(null);
  const icons = useRef(new Map<string, string>()); // glyph → PNG data URL
  const indexRef = useRef(index);
  indexRef.current = index;

  // Foreground: follow the stage's player.
  useEffect(() => {
    if (!frames?.length || document.hidden) return;
    show(frames[index % frames.length].glyph);
  }, [frames, index]);

  // Background: run the loop on the worker's clock until the tab is visible again.
  useEffect(() => {
    if (!frames?.length || typeof Worker === "undefined") return;
    let worker: Worker | null = null;
    let url: string | null = null;
    let i = 0;
    const stop = () => {
      worker?.terminate();
      worker = null;
      if (url) URL.revokeObjectURL(url);
      url = null;
    };
    const onVisibility = () => {
      if (!document.hidden) {
        stop();
        show(frames[indexRef.current % frames.length].glyph);
        return;
      }
      if (worker) return;
      url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
      worker = new Worker(url);
      i = indexRef.current % frames.length;
      worker.onmessage = () => {
        i = (i + 1) % frames.length;
        show(frames[i].glyph);
        worker?.postMessage(frames[i].ms);
      };
      worker.postMessage(frames[i].ms);
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [frames]);

  // Restore when stopped or unmounted.
  useEffect(() => {
    if (frames !== null) return;
    restore();
  }, [frames]);
  useEffect(() => restore, []);

  function show(glyph: string) {
    let href = icons.current.get(glyph);
    if (!href) {
      const canvas = Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE });
      const ctx = canvas.getContext("2d");
      if (!ctx) return; // no canvas (e.g. jsdom)
      drawIcon(ctx, glyph);
      href = canvas.toDataURL("image/png");
      icons.current.set(glyph, href);
    }
    if (!original.current) {
      const icon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      original.current = { icon, href: icon?.getAttribute("href") ?? null };
    }
    const link =
      original.current.icon ??
      (ownIcon.current ??= document.head.appendChild(Object.assign(document.createElement("link"), { rel: "icon" })));
    link.href = href;
  }

  function restore() {
    const o = original.current;
    if (!o) return;
    if (o.icon) {
      if (o.href === null) o.icon.removeAttribute("href");
      else o.icon.setAttribute("href", o.href);
    }
    ownIcon.current?.remove();
    ownIcon.current = null;
    original.current = null;
  }
}

// Black glyph on a white rounded tile with a gray edge: the tile stands out on
// dark tab strips, the edge and glyph on light ones, whatever the OS theme says.
function drawIcon(ctx: CanvasRenderingContext2D, glyph: string) {
  const pad = SIZE * 0.04;
  const r = SIZE * 0.2;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.beginPath();
  ctx.roundRect(pad, pad, SIZE - pad * 2, SIZE - pad * 2, r);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = SIZE * 0.05;
  ctx.strokeStyle = "#8a8a8a";
  ctx.stroke();

  // One fixed size for every frame, so loops that move or grow (▖▘▝▗, ⠁⠃⠇)
  // keep their motion instead of being refit per frame.
  ctx.font = `${SIZE * 0.78}px ${GLYPH_FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
}
