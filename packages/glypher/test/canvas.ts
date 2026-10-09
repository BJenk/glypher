import { vi } from "vitest";

// jsdom has no canvas (vitest.setup.ts makes getContext return null). This
// stub records the last glyph drawn and encodes it in the "PNG" data URL, so
// tests can read which frame an icon shows.
export function stubCanvas() {
  let last = "";
  const ctx = {
    font: "", textAlign: "", textBaseline: "", fillStyle: "", strokeStyle: "", lineWidth: 0,
    clearRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {},
    fillText(text: string) { last = text; },
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => `data:image/png;glyph=${last}`);
  return ctx;
}

export const iconHrefs = () =>
  Array.from(document.querySelectorAll("link[rel~='icon']")).map((l) => l.getAttribute("href"));
