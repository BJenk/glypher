import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../src/element";
import { stubCanvas, iconHrefs } from "./canvas";

const shown = (el: Element) => Array.from(el.shadowRoot!.querySelectorAll("span.on")).map((s) => s.textContent);
const mount = (html: string) => {
  document.body.innerHTML = html;
  return document.body.firstElementChild!;
};

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe("<glyph-loop>", () => {
  it("plays the frames in its attribute, labelled for screen readers", () => {
    const el = mount('<glyph-loop frames="✎✏✐" speed="100"></glyph-loop>');
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-label")).toBe("Loading");
    expect(shown(el)).toEqual(["✎"]);
    vi.advanceTimersByTime(100);
    expect(shown(el)).toEqual(["✏"]);
  });
  it("uses per-frame durations", () => {
    const el = mount('<glyph-loop frames="ab" durations="100,500"></glyph-loop>');
    vi.advanceTimersByTime(100);
    expect(shown(el)).toEqual(["b"]);
    vi.advanceTimersByTime(499);
    expect(shown(el)).toEqual(["b"]);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toEqual(["a"]);
  });
  it("follows attribute changes", () => {
    const el = mount('<glyph-loop frames="ab" speed="100"></glyph-loop>');
    el.setAttribute("frames", "xyz");
    expect(el.shadowRoot!.querySelectorAll("span")).toHaveLength(3);
    el.setAttribute("label", "Saving");
    expect(el.getAttribute("aria-label")).toBe("Saving");
  });
  it("pauses with playing=false, and stops its timer when removed", () => {
    const el = mount('<glyph-loop frames="ab" speed="100" playing="false"></glyph-loop>');
    vi.advanceTimersByTime(500);
    expect(shown(el)).toEqual(["a"]);
    el.setAttribute("playing", "true");
    expect(vi.getTimerCount()).toBe(1);
    el.remove();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("treats markup in its frames as text", () => {
    const el = mount('<glyph-loop frames="&lt;img src=x onerror=alert(1)&gt;"></glyph-loop>');
    expect(el.shadowRoot!.querySelector("img")).toBeNull();
  });
  it("holds the first frame for reduced motion", () => {
    window.matchMedia = vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    const el = mount('<glyph-loop frames="ab" speed="100"></glyph-loop>');
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toEqual(["a"]);
  });
});

describe("<glyph-favicon>", () => {
  it("animates the tab icon and restores it when removed", () => {
    stubCanvas();
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico">';
    const el = mount('<glyph-favicon frames="ab" speed="100"></glyph-favicon>');
    expect((el as HTMLElement).hidden).toBe(true);
    expect(iconHrefs()).toEqual(["data:image/png;glyph=a"]);
    vi.advanceTimersByTime(100);
    expect(iconHrefs()).toEqual(["data:image/png;glyph=b"]);
    el.remove();
    expect(iconHrefs()).toEqual(["/favicon.ico"]);
  });
});
