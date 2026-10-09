import { defineConfig } from "tsup";

export default defineConfig([
  {
    // React entry: marked as client code so Next.js server components can render it.
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "es2022",
    dts: true,
    external: ["react"],
    banner: { js: '"use client";' },
  },
  {
    // Web components: one self-contained file, so it loads straight from a CDN.
    entry: { element: "src/element.ts" },
    format: ["esm"],
    target: "es2022",
    dts: true,
  },
]);
