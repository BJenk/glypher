import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import ts from "typescript";
import { loaderComponent } from "./loaderComponent";
import type { Animation } from "@/store/animation";

const animation: Animation = {
  version: 1, loop: true, speedMs: 100, background: "#fff", ink: "#000",
  frames: [{ id: "a", cp: 0x2630, durationMs: 250 }, { id: "b", cp: 0x2631 }],
};

// Compiles the generated source and loads it as a module, handing it this
// project's React.
function load(src: string): { GlyphLoader: React.ComponentType<Record<string, unknown>> } {
  const js = ts.transpileModule(src, {
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  new Function("require", "exports", "React", js)(() => React, exports, React);
  return exports as never;
}

describe("loaderComponent", () => {
  it("embeds frames and per-frame durations", () => {
    const s = loaderComponent(animation);
    expect(s).toContain('const FRAMES = ["\\u{2630}", "\\u{2631}"];');
    expect(s).toContain("const MS = [250, 100];");
    expect(s).toContain("export function GlyphLoader(");
  });
  it("starts the Next.js version with the directive, then says to save it as its own file", () => {
    const lines = loaderComponent(animation, { next: true }).split("\n");
    expect(lines[0]).toMatch(/^"use client";/);
    expect(lines[1]).toContain("Save this as its own file: app/components/GlyphLoader.tsx");
    expect(loaderComponent(animation).split("\n")[0]).toContain("Save this as its own file");
  });
  it("renders a status that steps through the frames on their own timing", () => {
    vi.useFakeTimers();
    const { GlyphLoader } = load(loaderComponent(animation));
    render(<GlyphLoader label="Saving" />);
    const visible = () =>
      [...screen.getByRole("status", { name: "Saving" }).children].find(
        (el) => (el as HTMLElement).style.visibility === "visible",
      )?.textContent;
    expect(visible()).toBe("☰");
    act(() => vi.advanceTimersByTime(240));
    expect(visible()).toBe("☰");
    act(() => vi.advanceTimersByTime(20));
    expect(visible()).toBe("☱");
    act(() => vi.advanceTimersByTime(100));
    expect(visible()).toBe("☰");
    vi.useRealTimers();
  });
});
