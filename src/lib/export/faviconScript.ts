import type { Animation } from "@/store/animation";

// Escapes everything outside printable ASCII, so the script survives pages that
// aren't served as UTF-8 and editors that mangle pasted symbols.
export function jsString(s: string): string {
  return `"${[...s]
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (ch === '"' || ch === "\\") return `\\${ch}`;
      return cp >= 0x20 && cp < 0x7f ? ch : `\\u{${cp.toString(16)}}`;
    })
    .join("")}"`;
}

// The plain JavaScript that plays the animation as the page's favicon: each
// frame is a black glyph on a white rounded tile, readable on light and dark
// tab strips. Every export format below wraps this same code.
export function faviconCode(animation: Animation): string {
  const glyphs = animation.frames.map((f) => String.fromCodePoint(f.cp));
  const durations = animation.frames.map((f) => f.durationMs ?? animation.speedMs);

  // Written to be valid both as plain JavaScript and as strict TypeScript, so
  // it can be pasted into .js, .jsx, .ts and .tsx files alike.
  return `(() => {
  const root = document.documentElement;
  if (root.dataset.glypherFavicon) return; // already running (e.g. re-rendered)
  root.dataset.glypherFavicon = "on";
  const frames = [${glyphs.map(jsString).join(", ")}];
  const ms = [${durations.join(", ")}]; // how long each frame shows

  // Draw every frame once: a black glyph on a white tile with a gray edge.
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx || !frames.length) return;
  const icons = frames.map((glyph) => {
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.roundRect(2.5, 2.5, size - 5, size - 5, 13);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#8a8a8a";
    ctx.stroke();
    ctx.font = (size * 0.78) + "px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.fillText(glyph, size / 2, size / 2 + 2.5);
    return canvas.toDataURL("image/png");
  });

  // Point the site's icon tags at the loop. They're updated, not removed,
  // because frameworks like React and Next.js own those tags.
  let links = Array.from(document.getElementsByTagName("link")).filter((l) => l.relList.contains("icon"));
  if (!links.length) {
    const link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
    links = [link];
  }
  links.forEach((l) => { l.type = "image/png"; l.removeAttribute("sizes"); });

  // Background tabs slow page timers to about once a second; a worker's timer
  // keeps the real speed. Falls back to a plain timer if workers are blocked.
  const worker = (() => {
    try {
      const src = "onmessage = (e) => setTimeout(() => postMessage(0), e.data);";
      return new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
    } catch {
      return undefined;
    }
  })();
  let useWorker = !!worker;

  let i = 0;
  const show = () => links.forEach((l) => { l.href = icons[i]; });
  const later = () => {
    if (worker && useWorker) worker.postMessage(ms[i]);
    else setTimeout(next, ms[i]);
  };
  const next = () => {
    i = (i + 1) % frames.length;
    show();
    later();
  };
  if (worker) {
    worker.onmessage = () => next();
    // A worker can fail after creation (e.g. a strict Content-Security-Policy);
    // the plain timer picks up the frame it was waiting on.
    worker.onerror = () => {
      useWorker = false;
      later();
    };
  }
  show();
  later();
})();`;
}

// Comments can't contain "--" safely, and a block comment must not close early.
export function preview(animation: Animation): string {
  return animation.frames
    .map((f) => String.fromCodePoint(f.cp))
    .join("")
    .replace(/--/g, "- -")
    .replace(/\*\//g, "* /");
}

// Plain HTML: paste at the end of <head>.
export function faviconScript(animation: Animation): string {
  return `<!-- Glypher favicon loop: ${preview(animation)} -->
<script>
${faviconCode(animation)}
</script>`;
}

// React: a component that starts the loop once it mounts.
export function faviconReact(animation: Animation): string {
  return `// Glypher favicon loop: ${preview(animation)}
import { useEffect } from "react";

export function GlypherFavicon() {
  useEffect(() => {
${indent(faviconCode(animation), 4)}
  }, []);
  return null;
}
`;
}

// Next.js: a component wrapping next/script, which runs the code once the page
// is interactive and keeps it running across client-side navigation.
export function faviconNext(animation: Animation): string {
  // Inside a template literal: keep backslashes, backticks and \${ literal.
  const code = faviconCode(animation).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `// Glypher favicon loop: ${preview(animation)}
import Script from "next/script";

export function GlypherFavicon() {
  return (
    <Script id="glypher-favicon" strategy="afterInteractive">{\`
${indent(code, 6)}
    \`}</Script>
  );
}
`;
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

// Vue / Nuxt: a single-file component that starts the loop once mounted.
export function faviconVue(animation: Animation): string {
  return `<!-- Glypher favicon loop: ${preview(animation)} -->
<script setup>
import { onMounted } from "vue";

onMounted(() => {
${indent(faviconCode(animation), 2)}
});
</script>

<template><!-- plays in the tab icon --></template>
`;
}
