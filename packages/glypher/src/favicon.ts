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
  // roundRect is newer than canvas (Safari 16, Firefox 112); a square tile beats no icon.
  if (typeof ctx.roundRect === "function") ctx.roundRect(pad, pad, SIZE - pad * 2, SIZE - pad * 2, SIZE * 0.2);
  else ctx.rect(pad, pad, SIZE - pad * 2, SIZE - pad * 2);
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

// Each glyph as a PNG data URL, or null where the browser can't draw them.
function renderIcons(frames: string[], font: string): string[] | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return frames.map((glyph) => {
      drawIcon(ctx, glyph, font);
      return canvas.toDataURL("image/png");
    });
  } catch {
    return null;
  }
}

function restoreAttr(link: HTMLLinkElement, name: string, value: string | null) {
  if (value === null) link.removeAttribute(name);
  else link.setAttribute(name, value);
}

interface Player {
  icons: string[];
  index: number;
}

// Several loops can run at once (two components, React StrictMode's double
// effects). They share one hold on the page's icon tags: the page's own
// values are saved when the first starts and restored when the last stops,
// and the newest loop is the one shown.
const players: Player[] = [];
let page: {
  links: HTMLLinkElement[];
  saved: { link: HTMLLinkElement; href: string | null; type: string | null; sizes: string | null }[];
  added: HTMLLinkElement | null;
} | null = null;

// Point the page's icon tags at the loop. They're updated, not replaced,
// because frameworks like React and Next.js own those tags.
function takeIcons() {
  if (page) return;
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
  page = { links, saved, added };
}

function releaseIcons() {
  if (!page) return;
  page.added?.remove();
  for (const s of page.saved) {
    restoreAttr(s.link, "href", s.href);
    restoreAttr(s.link, "type", s.type);
    restoreAttr(s.link, "sizes", s.sizes);
  }
  page = null;
}

function paint() {
  const top = players[players.length - 1];
  if (top && page) page.links.forEach((l) => { l.href = top.icons[top.index]; });
}

// Plays the loop as the page's favicon. Returns a stop function that puts the
// page's own icon back once no other loop is playing.
export function startFavicon(loop: Loop, { font = "system-ui, sans-serif" }: FaviconOptions = {}): () => void {
  if (typeof document === "undefined" || loop.frames.length === 0) return () => {};
  const icons = renderIcons(loop.frames, font);
  if (!icons) return () => {};

  const player: Player = { icons, index: 0 };
  players.push(player);
  takeIcons();
  paint();

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let worker: Worker | undefined;
  let url: string | undefined;
  const schedule = () => {
    if (stopped || icons.length < 2) return;
    if (worker) worker.postMessage(loop.durations[player.index]);
    else timer = setTimeout(next, loop.durations[player.index]);
  };
  const next = () => {
    if (stopped) return;
    player.index = (player.index + 1) % icons.length;
    if (players[players.length - 1] === player) paint();
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
  schedule();

  return () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(timer);
    worker?.terminate();
    if (url) URL.revokeObjectURL(url);
    players.splice(players.indexOf(player), 1);
    if (players.length === 0) releaseIcons();
    else paint();
  };
}
