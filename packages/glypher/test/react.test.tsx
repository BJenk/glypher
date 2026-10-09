import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { GlyphLoop, GlyphFavicon } from "../src/index";
import { stubCanvas, iconHrefs } from "./canvas";

const visible = () =>
  Array.from(screen.getByRole("status").children)
    .filter((c) => (c as HTMLElement).style.visibility === "visible")
    .map((c) => c.textContent);
const reduceMotion = () => {
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  vi.useFakeTimers();
  document.head.innerHTML = "";
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe("GlyphLoop", () => {
  it("shows the first frame, labelled for screen readers", () => {
    render(<GlyphLoop frames="✎✏✐" />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
    expect(visible()).toEqual(["✎"]);
  });
  it("hides every frame from screen readers, so changes aren't announced", () => {
    render(<GlyphLoop frames="ab" />);
    for (const c of Array.from(screen.getByRole("status").children)) expect(c.getAttribute("aria-hidden")).toBe("true");
  });
  it("advances on each frame's duration", () => {
    render(<GlyphLoop frames="ab" durations={[100, 500]} />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(visible()).toEqual(["b"]);
    act(() => { vi.advanceTimersByTime(499); });
    expect(visible()).toEqual(["b"]);
    act(() => { vi.advanceTimersByTime(1); });
    expect(visible()).toEqual(["a"]);
  });
  it("holds its frame when paused", () => {
    const { rerender } = render(<GlyphLoop frames="abc" speed={100} />);
    act(() => { vi.advanceTimersByTime(100); });
    rerender(<GlyphLoop frames="abc" speed={100} playing={false} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(visible()).toEqual(["b"]);
  });
  it("keeps its timing across re-renders with equal props", () => {
    const { rerender } = render(<GlyphLoop frames={["a", "b"]} speed={100} />);
    act(() => { vi.advanceTimersByTime(60); });
    rerender(<GlyphLoop frames={["a", "b"]} speed={100} />);
    act(() => { vi.advanceTimersByTime(40); });
    expect(visible()).toEqual(["b"]);
  });
  it("stays on the first frame when the visitor prefers reduced motion", () => {
    reduceMotion();
    render(<GlyphLoop frames="ab" speed={100} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(visible()).toEqual(["a"]);
  });
  it("passes label, size and className through", () => {
    render(<GlyphLoop frames="ab" label="Saving" size={24} className="x" />);
    const el = screen.getByRole("status", { name: "Saving" });
    expect(el.className).toBe("x");
    expect(el.style.fontSize).toBe("24px");
  });
  it("renders nothing for unusable frames", () => {
    const { container } = render(<GlyphLoop frames={42 as unknown as string} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("GlyphFavicon", () => {
  it("plays in the tab and restores the icon on unmount", () => {
    stubCanvas();
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico">';
    const { container, unmount } = render(<GlyphFavicon frames="ab" speed={100} />);
    expect(container.innerHTML).toBe("");
    expect(iconHrefs()).toEqual(["data:image/png;glyph=a"]);
    act(() => { vi.advanceTimersByTime(100); });
    expect(iconHrefs()).toEqual(["data:image/png;glyph=b"]);
    unmount();
    expect(iconHrefs()).toEqual(["/favicon.ico"]);
  });
  it("restores the icon while paused", () => {
    stubCanvas();
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico">';
    const { rerender } = render(<GlyphFavicon frames="ab" />);
    rerender(<GlyphFavicon frames="ab" playing={false} />);
    expect(iconHrefs()).toEqual(["/favicon.ico"]);
  });
  it("shows only the first frame, still, for reduced motion", () => {
    stubCanvas();
    reduceMotion();
    render(<GlyphFavicon frames="ab" speed={100} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(iconHrefs()).toEqual(["data:image/png;glyph=a"]);
  });
});
