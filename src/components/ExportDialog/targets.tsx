import type { ReactNode } from "react";
import type { Animation } from "../../store/animation";
import {
  PACKAGE, htmlFaviconSnippet, htmlLoopSnippet, reactFaviconSnippet, reactLoopSnippet,
} from "../../lib/export/snippets";

// One way to use the loop: how to install it, and the tag to add.
export type Target = {
  id: "react" | "html";
  label: string; // tab name
  install?: string; // shown above the snippet when there's a setup step
  generate: (a: Animation) => string;
  intro: ReactNode;
  tip?: ReactNode;
};

const INSTALL = `npm install ${PACKAGE}`;

const LOADER_TARGETS: Target[] = [
  {
    id: "react",
    label: "React",
    install: INSTALL,
    generate: reactLoopSnippet,
    intro: <>Install the package, then render <code>&lt;GlyphLoop /&gt;</code> wherever the loop should play. Works in Next.js server and client components.</>,
    tip: <>It inherits the surrounding text color and size. Pass <code>size</code>, <code>label</code> or <code>playing</code> to change it.</>,
  },
  {
    id: "html",
    label: "HTML",
    generate: htmlLoopSnippet,
    intro: <>Add the script tag once, then put <code>&lt;glyph-loop&gt;</code> wherever the loop should play. Works in plain HTML, Vue, Angular and site builders.</>,
    tip: <>It inherits the surrounding text color and size, so style it with CSS like any text.</>,
  },
];

const FAVICON_TARGETS: Target[] = [
  {
    id: "react",
    label: "React",
    install: INSTALL,
    generate: reactFaviconSnippet,
    intro: <>Install the package, then render <code>&lt;GlyphFavicon /&gt;</code> once, near the root of your app, such as in your root layout.</>,
    tip: <>Keep your normal favicon: the loop takes over its tag while playing and puts it back when it stops.</>,
  },
  {
    id: "html",
    label: "HTML",
    generate: htmlFaviconSnippet,
    intro: <>Paste both lines into your page&apos;s <code>&lt;head&gt;</code>, or into a site builder&apos;s &ldquo;custom code&rdquo; setting.</>,
    tip: <>Keep your normal favicon: the loop takes over its tag while playing and puts it back when it stops.</>,
  },
];

// Where the loop plays decides which tag you need; the dialog asks this first.
export type ExportMode = {
  id: string;
  label: string;
  description: string;
  summary: string; // opening line above the chosen framework's instructions
  targets: Target[];
  notes: ReactNode[];
};

const FONT_NOTE = "Glyphs are drawn with each visitor’s own fonts, so check the macOS and Android marks.";
const MOTION_NOTE = "Visitors who prefer reduced motion see the first frame, still.";

export const EXPORT_MODES: ExportMode[] = [
  {
    id: "page",
    label: "In your page",
    description: "A component you place anywhere, like a loading spinner.",
    summary: "Plays this loop inside your page.",
    targets: LOADER_TARGETS,
    notes: [FONT_NOTE, MOTION_NOTE],
  },
  {
    id: "tab",
    label: "In the browser tab",
    description: "Replaces your site’s favicon with the loop.",
    summary: "Plays this loop as your site’s tab icon.",
    targets: FAVICON_TARGETS,
    notes: ["Animates in Chrome, Edge and Firefox. Safari shows the first frame.", FONT_NOTE],
  },
];
