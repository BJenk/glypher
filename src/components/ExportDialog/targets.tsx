import type { ReactNode } from "react";
import type { Animation } from "@/store/animation";
import { loaderComponent } from "@/lib/export/loaderComponent";
import {
  faviconNext,
  faviconReact,
  faviconScript,
  faviconVue,
} from "@/lib/export/faviconScript";

// One way to use the loop: the code, what to do with it, and where it goes.
export type Target = {
  id: string;
  label: string; // tab name
  file: string; // shown in the code block's toolbar
  generate: (a: Animation) => string;
  intro: ReactNode;
  placementTitle?: string; // defaults to "Where it goes"
  placement: string;
  tip?: ReactNode;
};

const HEAD_PLACEMENT = (file: string) => `<!-- ${file} -->
<head>
  <title>Your site</title>
  <link rel="icon" href="/favicon.ico">
  …
  <!-- paste the script here, just before </head> -->
</head>`;

// Favicon: the loop as the browser tab's icon, set up per framework.
export const FAVICON_TARGETS: Target[] = [
  {
    id: "html",
    label: "HTML",
    file: "HTML",
    generate: faviconScript,
    intro: <>Copy the script and paste it into your page&apos;s HTML, just before <code>&lt;/head&gt;</code>.</>,
    placement: HEAD_PLACEMENT("index.html"),
    tip: (
      <>
        Using a site builder? Look for a setting like &ldquo;custom code&rdquo;, &ldquo;header code&rdquo; or
        &ldquo;code injection&rdquo; and paste it there.
      </>
    ),
  },
  {
    id: "react",
    label: "React",
    file: "src/GlypherFavicon.jsx",
    generate: faviconReact,
    intro: (
      <>
        Save this as a new file, <code>src/GlypherFavicon.jsx</code> (or <code>.tsx</code>), then render it once
        near the root of your app.
      </>
    ),
    placement: `import { GlypherFavicon } from "./GlypherFavicon";

export default function App() {
  return (
    <>
      <GlypherFavicon />
      …
    </>
  );
}`,
    tip: <>Using Vite or Create React App? You can paste the HTML version into <code>index.html</code> instead.</>,
  },
  {
    id: "next",
    label: "Next.js",
    file: "app/GlypherFavicon.tsx",
    generate: faviconNext,
    intro: <>Save this as a new file, <code>app/GlypherFavicon.tsx</code>, then add it to your root layout.</>,
    placement: `// app/layout.tsx
import { GlypherFavicon } from "./GlypherFavicon";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlypherFavicon />
      </body>
    </html>
  );
}`,
    tip: (
      <>
        Keep your normal <code>app/favicon.ico</code>: the script takes over its tag, and Safari shows it as the
        still icon. On the Pages Router, render it in <code>pages/_app.tsx</code>.
      </>
    ),
  },
  {
    id: "vue",
    label: "Vue",
    file: "GlypherFavicon.vue",
    generate: faviconVue,
    intro: (
      <>
        Save this as <code>src/components/GlypherFavicon.vue</code>, then render it once in your root component.
      </>
    ),
    placement: `<!-- src/App.vue -->
<script setup>
import GlypherFavicon from "./components/GlypherFavicon.vue";
</script>

<template>
  <GlypherFavicon />
  …
</template>`,
    tip: (
      <>
        Using Nuxt? Save it in <code>components/</code> and add <code>&lt;GlypherFavicon /&gt;</code> to{" "}
        <code>app.vue</code>; Nuxt imports it for you.
      </>
    ),
  },
  {
    id: "angular",
    label: "Angular",
    file: "src/index.html",
    generate: faviconScript,
    intro: (
      <>
        Paste the script into <code>src/index.html</code>, just before <code>&lt;/head&gt;</code>. Angular copies
        that file into every build, so no component is needed.
      </>
    ),
    placement: HEAD_PLACEMENT("src/index.html"),
    tip: <>Works with server-side rendering too: the script only runs in the browser.</>,
  },
];

const LOADER_USAGE = (from: string) => `import { GlyphLoader } from "${from}";

<GlyphLoader />                        // inherits the text size
<GlyphLoader size="2rem" />            // bigger
<GlyphLoader label="Saving" />         // what screen readers announce
<GlyphLoader playing={isLoading} />    // pauses when false`;

// In-app: the loop as a component that plays inside the page, like a spinner.
export const LOADER_TARGETS: Target[] = [
  {
    id: "react",
    label: "React",
    file: "GlyphLoader.jsx",
    generate: (a) => loaderComponent(a),
    intro: (
      <>
        Create a new file, <code>GlyphLoader.jsx</code> (or <code>.tsx</code>), and paste this into it on its own.
        Then import <code>&lt;GlyphLoader /&gt;</code> wherever you want the loop to play.
      </>
    ),
    placementTitle: "How to use it",
    placement: LOADER_USAGE("./GlyphLoader"),
    tip: <>It inherits the surrounding text color and font, so style it like any text.</>,
  },
  {
    id: "next",
    label: "Next.js",
    file: "app/components/GlyphLoader.tsx",
    generate: (a) => loaderComponent(a, { next: true }),
    intro: (
      <>
        Create a new file, <code>app/components/GlyphLoader.tsx</code>, and paste this into it on its own, not into{" "}
        <code>layout.tsx</code> or a page. Then import <code>&lt;GlyphLoader /&gt;</code> anywhere.
      </>
    ),
    placementTitle: "How to use it",
    placement: `// app/layout.tsx, or any page
${LOADER_USAGE("./components/GlyphLoader")}`,
    tip: (
      <>
        It needs its own file because <code>&quot;use client&quot;</code> must be the file&apos;s first line. Server
        components, including your layout, can still import and render it.
      </>
    ),
  },
];

// Where the loop plays decides what code you need; the dialog asks this first.
export type ExportMode = {
  id: string;
  label: string;
  description: string;
  summary: string; // opening line above the chosen framework's instructions
  targets: Target[];
  notes: ReactNode[];
};

const FONT_NOTE = "Glyphs are drawn with each visitor’s own fonts, so check the macOS and Android marks.";

export const EXPORT_MODES: ExportMode[] = [
  {
    id: "page",
    label: "In your page",
    description: "A component you place anywhere, like a loading spinner.",
    summary: "Plays this loop inside your page.",
    targets: LOADER_TARGETS,
    notes: [FONT_NOTE],
  },
  {
    id: "tab",
    label: "In the browser tab",
    description: "Replaces your site’s favicon with the loop.",
    summary: "Plays this loop as your site’s tab icon.",
    targets: FAVICON_TARGETS,
    notes: ["Animates in Chrome, Edge and Firefox. Safari keeps the first frame.", FONT_NOTE],
  },
];

