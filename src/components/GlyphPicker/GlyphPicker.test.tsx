import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlyphPicker } from "./GlyphPicker";
import { useAnimation } from "@/store/animation";

beforeEach(() => useAnimation.getState().clear());

describe("GlyphPicker", () => {
  it("searches by name and adds a covered glyph on click", async () => {
    render(<GlyphPicker />);
    await userEvent.type(screen.getByPlaceholderText(/search/i), "greek capital letter psi");
    const tile = await screen.findByRole("button", { name: /GREEK CAPITAL LETTER PSI/i });
    await userEvent.click(tile);
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual([0x3a8]);
  });

  it("does not show an addable button for un-named codepoints (private-use)", async () => {
    render(<GlyphPicker />);
    // U+E000 is private-use: has no name, so search returns no results.
    await userEvent.type(screen.getByPlaceholderText(/search/i), "U+E000");
    // No result with an "add" label because the codepoint has no Unicode name.
    expect(screen.queryByRole("button", { name: /add/i })).toBeNull();
  });

  it("adds a glyph from a script with no bundled Noto face (Tibetan Syllable OM)", async () => {
    render(<GlyphPicker />);
    // U+0F00 "TIBETAN SYLLABLE OM": no Noto face is loaded for Tibetan, so it
    // falls back to the platform's fonts.
    await userEvent.type(screen.getByPlaceholderText(/search/i), "TIBETAN SYLLABLE OM");
    const tile = await screen.findByRole("button", { name: /TIBETAN SYLLABLE OM/i });
    // Portability lives on the accessible label / tooltip
    // (kept out of the visible cell to stay compact).
    expect(tile.getAttribute("aria-label")).toMatch(/built into macOS and Android/i);
    // Clicking it should add cp 0x0F00 to the store.
    await userEvent.click(tile);
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual([0x0f00]);
  });

  it("groups results by portability, safest first", async () => {
    render(<GlyphPicker />);
    // "chess" matches symbols built in everywhere (♔) and ones only one system has.
    await userEvent.type(screen.getByPlaceholderText(/search/i), "chess");
    const headers = screen.getAllByText(/^(Safest|.* only$)/);
    expect(headers[0].textContent).toMatch(/^Safest: built into macOS and Android/);
  });

  it("leaves out glyphs no measured system has a font for", async () => {
    render(<GlyphPicker />);
    // U+1F785 MEDIUM BOLD WHITE CIRCLE: only placeholder boxes on macOS and Android.
    await userEvent.type(screen.getByPlaceholderText(/search/i), "medium bold white circle");
    expect(screen.queryByRole("button", { name: /MEDIUM BOLD WHITE CIRCLE/ })).toBeNull();
    expect(screen.getByText("no glyphs match")).toBeTruthy();
  });

  it("pins the current section's header while scrolling", () => {
    const { container } = render(<GlyphPicker />);
    const box = container.querySelector("[class*=scroll]") as HTMLDivElement;
    expect(container.querySelector("[class*=pin]")).toBeNull();
    box.scrollTop = 500;
    fireEvent.scroll(box);
    expect(container.querySelector("[class*=pin]")?.textContent).toMatch(/^Safest: built into macOS and Android/);
  });
});
