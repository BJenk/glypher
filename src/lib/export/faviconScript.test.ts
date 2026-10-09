import { describe, it, expect } from "vitest";
import ts from "typescript";
import { faviconScript, faviconReact, faviconNext, faviconVue } from "./faviconScript";
import type { Animation } from "../../store/animation";

const anim = (frames: Animation["frames"], speedMs = 150): Animation => ({
  version: 1, loop: true, speedMs, background: "#fff", ink: "#000", frames,
});

describe("faviconScript", () => {
  it("embeds the frames as escaped code points and previews them in a comment", () => {
    const s = faviconScript(anim([{ id: "a", cp: 0x2630 }, { id: "b", cp: 0x1f785 }]));
    expect(s).toContain("<!-- Glypher favicon loop: ☰🞅 -->");
    expect(s).toContain('const frames = ["\\u{2630}", "\\u{1f785}"];');
    expect(s).toContain("const ms = [150, 150];");
  });
  it("lists per-frame durations when they differ", () => {
    const s = faviconScript(anim([{ id: "a", cp: 0x41, durationMs: 400 }, { id: "b", cp: 0x42 }], 120));
    expect(s).toContain('const frames = ["A", "B"];');
    expect(s).toContain("const ms = [400, 120];");
  });
  it("is a single script that parses as JavaScript", () => {
    const s = faviconScript(anim([{ id: "a", cp: 0x22 }, { id: "b", cp: 0x5c }]));
    const body = s.slice(s.indexOf("<script>") + 8, s.indexOf("</script>"));
    expect(() => new Function(body)).not.toThrow();
    expect(s.match(/<script>/g)).toHaveLength(1);
  });

  // Compiles each variant as TSX and reports syntax errors.
  const syntaxErrors = (src: string) =>
    ts.transpileModule(src, { reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.Preserve } })
      .diagnostics?.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")) ?? [];
  const tricky = anim([{ id: "a", cp: 0x60 }, { id: "b", cp: 0x5c }, { id: "c", cp: 0x24 }, { id: "d", cp: 0x7b }]);

  it("generates a React component that compiles", () => {
    const s = faviconReact(tricky);
    expect(s).toContain("export function GlypherFavicon()");
    expect(s).toContain("useEffect(");
    expect(syntaxErrors(s)).toEqual([]);
  });
  it("generates a Next.js component whose script text survives the template literal", () => {
    const s = faviconNext(tricky);
    expect(s).toContain('<Script id="glypher-favicon" strategy="afterInteractive">');
    expect(syntaxErrors(s)).toEqual([]);
    // Evaluate the template literal and check it yields the original code.
    const literal = s.slice(s.indexOf("{`") + 1, s.lastIndexOf("`}") + 1);
    const text = new Function(`return ${literal};`)() as string;
    expect(text).toContain('const frames = ["`", "\\\\", "$", "{"];');
    expect(() => new Function(text)).not.toThrow();
  });
  // Pulls the code out of a component's <script> block and parses the part
  // between the mount hook's braces.
  const hookBody = (s: string, hook: string) => s.slice(s.indexOf(`${hook}(() => {`) + hook.length + 9, s.lastIndexOf("});"));
  it("generates a Vue component whose mount code parses", () => {
    const vue = faviconVue(tricky);
    expect(vue).toContain("<script setup>");
    expect(() => new Function(hookBody(vue, "onMounted"))).not.toThrow();
  });
});
