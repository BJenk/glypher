import type { Loop } from "./core";

const SIZE = 64; // canvas px; browsers scale icons down to 16–32px

// Background tabs throttle page timers to about once a second; a worker's
// timers aren't, so the icon keeps its real speed while the tab is hidden.
const WORKER_SRC = "onmessage = (e) => setTimeout(() => postMessage(0), e.data);";

export interface FaviconOptions {
  font?: string;
}

// Black glyph on a white rounded tile with a gray edge: readable on light and
// dark tab strips alike.
function drawIcon(ctx: CanvasRenderingContext2D, glyph: string, font: string) {
  const pad = SIZE * 0.04;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.beginPath();
  ctx.roundRect(pad, pad, SIZE - pad * 2, SIZE - pad * 2, SIZE * 0.2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = SIZE * 0.05;
  ctx.strokeStyle = "#8a8a8a";
  ctx.stroke();
  // One size for every frame, so loops that move or grow keep their motion.
  ctx.font = `${SIZE * 0.78}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
}

function restoreAttr(link: HTMLLinkElement, name: string, value: string | null) {
  if (value === null) link.removeAttribute(name);
  else link.setAttribute(name, value);
}

// Plays the loop as the page's favicon. Returns a stop function that puts the
// page's own icon back.
export function startFavicon(loop: Loop, { font = "system-ui, sans-serif" }: FaviconOptions = {}): () => void {
  if (typeof document === "undefined" || loop.frames.length === 0) return () => {};
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const icons = loop.frames.map((glyph) => {
    drawIcon(ctx, glyph, font);
    return canvas.toDataURL("image/png");
  });

  // Point the page's icon tags at the loop. They're updated, not replaced,
  // because frameworks like React and Next.js own those tags.
  let links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']"));
  const saved = links.map((link) => ({
    link,
    href: link.getAttribute("href"),
    type: link.getAttribute("type"),
    sizes: link.getAttribute("sizes"),
  }));
  let added: HTMLLinkElement | null = null;
  if (links.length === 0) {
    added = document.createElement("link");
    added.rel = "icon";
    document.head.appendChild(added);
    links = [added];
  }
  links.forEach((l) => {
    l.type = "image/png";
    l.removeAttribute("sizes");
  });

  let i = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let worker: Worker | undefined;
  let url: string | undefined;
  const show = () => links.forEach((l) => { l.href = icons[i]; });
  const schedule = () => {
    if (stopped || icons.length < 2) return;
    if (worker) worker.postMessage(loop.durations[i]);
    else timer = setTimeout(next, loop.durations[i]);
  };
  const next = () => {
    if (stopped) return;
    i = (i + 1) % icons.length;
    show();
    schedule();
  };
  if (icons.length > 1 && typeof Worker !== "undefined") {
    try {
      url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
      worker = new Worker(url);
      worker.onmessage = next;
      // A strict Content-Security-Policy can fail the worker after creation;
      // the page timer picks up the frame it was waiting on.
      worker.onerror = () => {
        worker?.terminate();
        worker = undefined;
        schedule();
      };
    } catch {
      worker = undefined;
    }
  }
  show();
  schedule();

  return () => {
    stopped = true;
    clearTimeout(timer);
    worker?.terminate();
    if (url) URL.revokeObjectURL(url);
    added?.remove();
    for (const s of saved) {
      restoreAttr(s.link, "href", s.href);
      restoreAttr(s.link, "type", s.type);
      restoreAttr(s.link, "sizes", s.sizes);
    }
  };
}
