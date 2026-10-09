import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
  // The editor uses the runtime's source directly, so tests need no build step.
  resolve: {
    alias: { "@bjenk/glypher": fileURLToPath(new URL("./packages/glypher/src/index.ts", import.meta.url)) },
  },
});
