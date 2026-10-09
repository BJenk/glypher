// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";

describe("outside a browser", () => {
  it("imports the web components without a DOM", async () => {
    await expect(import("../src/element")).resolves.toBeDefined();
  });
  it("server-renders the loop's first frame, and nothing for the favicon", async () => {
    const { GlyphLoop, GlyphFavicon } = await import("../src/index");
    const html = renderToString(
      <>
        <GlyphLoop frames="✎✏" />
        <GlyphFavicon frames="✎✏" />
      </>,
    );
    expect(html).toContain('role="status"');
    expect(html).toMatch(/visibility:visible">✎</);
  });
});
