import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startFavicon } from "../src/favicon";
import { stubCanvas, iconHrefs } from "./canvas";

beforeEach(() => {
  document.head.innerHTML = "";
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("startFavicon", () => {
  it("animates the page's icon and restores it exactly when stopped", () => {
    stubCanvas();
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon">';
    const stop = startFavicon({ frames: ["a", "b"], durations: [100, 200] });
    const link = document.querySelector("link")!;
    expect(link.getAttribute("href")).toBe("data:image/png;glyph=a");
    expect(link.getAttribute("type")).toBe("image/png");
    expect(link.hasAttribute("sizes")).toBe(false);
    vi.advanceTimersByTime(100);
    expect(link.getAttribute("href")).toBe("data:image/png;glyph=b");
    stop();
    expect(link.getAttribute("href")).toBe("/favicon.ico");
    expect(link.getAttribute("type")).toBe("image/x-icon");
    expect(link.getAttribute("sizes")).toBe("any");
    vi.advanceTimersByTime(1000);
    expect(link.getAttribute("href")).toBe("/favicon.ico");
  });
  it("updates every icon link", () => {
    stubCanvas();
    document.head.innerHTML = '<link rel="icon" href="/a.ico"><link rel="shortcut icon" href="/b.ico">';
    startFavicon({ frames: ["a"], durations: [100] });
    expect(iconHrefs()).toEqual(["data:image/png;glyph=a", "data:image/png;glyph=a"]);
  });
  it("adds an icon link when the page has none, and removes it after", () => {
    stubCanvas();
    const stop = startFavicon({ frames: ["a"], durations: [100] });
    expect(iconHrefs()).toEqual(["data:image/png;glyph=a"]);
    stop();
    expect(iconHrefs()).toEqual([]);
  });
  it("draws with the font it's given", () => {
    const ctx = stubCanvas();
    startFavicon({ frames: ["a"], durations: [100] }, { font: "MyFont" })();
    expect(ctx.font).toContain("MyFont");
  });
  it("leaves the page alone without canvas support", () => {
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico">';
    startFavicon({ frames: ["a", "b"], durations: [100, 100] })();
    expect(iconHrefs()).toEqual(["/favicon.ico"]);
  });
  it("does nothing with no frames", () => {
    stubCanvas();
    startFavicon({ frames: [], durations: [] });
    expect(iconHrefs()).toEqual([]);
  });
});
