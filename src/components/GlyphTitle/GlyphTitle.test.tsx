import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlyphTitle } from "./GlyphTitle";

describe("GlyphTitle", () => {
  it("reads as the plain word to assistive tech", () => {
    render(<GlyphTitle />);
    expect(screen.getByRole("heading", { level: 1, name: "Glypher" })).toBeTruthy();
  });
  it("starts each animated letter on its first frame", () => {
    const { container } = render(<GlyphTitle />);
    const visible = [...container.querySelectorAll("h1 > span")].map(
      (letter) => (letter.querySelector("[class*=on]") ?? letter).textContent,
    );
    expect(visible.join("")).toBe("GⳐYP𐪘ER");
  });
});
