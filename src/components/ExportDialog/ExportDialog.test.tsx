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
  await user.click(screen.getByRole("button", { name: "Get code" }));
  return user;
}

describe("ExportDialog", () => {
  it("opens on the in-page React component", async () => {
    await openDialog();
    expect(screen.getByRole("dialog", { name: "Get code" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /In your page/ }).getAttribute("aria-checked")).toBe("true");
    expect(tabs()).toEqual(["React", "Next.js"]);
    expect(code()).toContain("export function GlyphLoader(");
    expect(code()).not.toContain('"use client"');
    expect(screen.getByText("How to use it")).toBeTruthy();
  });
  it("gives the Next.js component with the client directive", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("tab", { name: "Next.js" }));
    expect(code()).toMatch(/^"use client";/);
  });
  it("switches to the favicon, keeping the chosen framework", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("tab", { name: "Next.js" }));
    await user.click(screen.getByRole("radio", { name: /In the browser tab/ }));
    expect(tabs()).toEqual(["HTML", "React", "Next.js", "Vue", "Angular"]);
    expect(screen.getByRole("tab", { name: "Next.js" }).getAttribute("aria-selected")).toBe("true");
    expect(code()).toContain('import Script from "next/script"');
    expect(screen.getByText(/Safari keeps the first frame/)).toBeTruthy();
  });
  it("covers every favicon framework, by click and arrow keys", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("radio", { name: /In the browser tab/ }));
    expect(code()).toContain("Glypher favicon loop: ☰☱");
    await user.click(screen.getByRole("tab", { name: "React" }));
    expect(code()).toContain("useEffect(");
    await user.keyboard("{ArrowRight}");
    expect(code()).toContain('import Script from "next/script"');
    await user.click(screen.getByRole("tab", { name: "Vue" }));
    expect(code()).toContain("<script setup>");
    await user.click(screen.getByRole("tab", { name: "Angular" }));
    expect(code()).toContain("<script>");
  });
  it("copies the code to the clipboard", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    const user = await openDialog();
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText.mock.calls[0][0]).toContain("GlyphLoader");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });
  it("closes on Escape", async () => {
    const user = await openDialog();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("is disabled with no frames", () => {
    render(<ExportDialog animation={{ ...animation, frames: [] }} />);
    expect((screen.getByRole("button", { name: "Get code" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
