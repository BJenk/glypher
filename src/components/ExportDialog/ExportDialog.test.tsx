import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportDialog } from "./ExportDialog";
import type { Animation } from "../../store/animation";

const animation: Animation = {
  version: 1, loop: true, speedMs: 150, background: "#fff", ink: "#000",
  frames: [{ id: "a", cp: 0x2630 }, { id: "b", cp: 0x2631 }],
};

const code = () => screen.getByTestId("export-code").textContent ?? "";
const tabs = () => screen.getAllByRole("tab").map((t) => t.textContent);

async function openDialog() {
  const user = userEvent.setup();
  render(<ExportDialog animation={animation} />);
  await user.click(screen.getByRole("button", { name: "Use it" }));
  return user;
}

describe("ExportDialog", () => {
  it("opens on the in-page React component, with its install line", async () => {
    await openDialog();
    expect(screen.getByRole("dialog", { name: "Use it" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /In your page/ }).getAttribute("aria-checked")).toBe("true");
    expect(tabs()).toEqual(["React", "HTML"]);
    expect(screen.getByText("npm install @bjenk/glypher")).toBeTruthy();
    expect(code()).toBe('import { GlyphLoop } from "@bjenk/glypher";\n\n<GlyphLoop frames="☰☱" speed={150} />');
  });
  it("gives the web component for HTML, with no install step", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("tab", { name: "HTML" }));
    expect(code()).toContain('<glyph-loop frames="☰☱" speed="150"></glyph-loop>');
    expect(screen.queryByText("npm install @bjenk/glypher")).toBeNull();
  });
  it("switches to the favicon, keeping the chosen framework", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("tab", { name: "HTML" }));
    await user.click(screen.getByRole("radio", { name: /In the browser tab/ }));
    expect(screen.getByRole("tab", { name: "HTML" }).getAttribute("aria-selected")).toBe("true");
    expect(code()).toContain("<glyph-favicon");
    expect(screen.getByText(/Safari shows the first frame/)).toBeTruthy();
  });
  it("moves between frameworks with arrow keys", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("tab", { name: "React" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "HTML" }).getAttribute("aria-selected")).toBe("true");
    expect(code()).toContain("<glyph-loop");
  });
  it("copies the snippet", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    const user = await openDialog();
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText.mock.calls[0][0]).toContain("<GlyphLoop");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });
  it("closes on Escape", async () => {
    const user = await openDialog();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("is disabled with no frames", () => {
    render(<ExportDialog animation={{ ...animation, frames: [] }} />);
    expect((screen.getByRole("button", { name: "Use it" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
