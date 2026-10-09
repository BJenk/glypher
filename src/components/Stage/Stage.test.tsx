import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stage } from "./Stage";
import { useAnimation } from "../../store/animation";

beforeEach(() => {
  useAnimation.getState().clear();
  useAnimation.getState().addFrame(0x3a8); // Ψ
});

describe("Stage", () => {
  it("renders the current glyph", () => {
    render(<Stage />);
    expect(screen.getByTestId("stage-glyph").textContent).toBe("Ψ");
  });
  it("toggles play/pause", async () => {
    render(<Stage />);
    const btn = screen.getByRole("button", { name: /pause|play/i });
    await userEvent.click(btn);
    expect(btn.textContent).toMatch(/play/i);
  });
  it("glyph span inline font-family includes Noto Sans Ethiopic for Ethiopic codepoints", () => {
    useAnimation.getState().clear();
    useAnimation.getState().addFrame(0x1275); // ት (Ethiopic)
    render(<Stage />);
    expect(screen.getByTestId("stage-glyph").style.fontFamily).toContain("Noto Sans Ethiopic");
  });
  it("shows the whole sequence as text", () => {
    useAnimation.getState().addFrame(0x1200); // ሀ
    render(<Stage />);
    expect(screen.getByTestId("stage-sequence").textContent).toBe("Ψሀ");
  });
  it("rates the sequence per platform", () => {
    useAnimation.getState().addFrame(0x1f785); // 🞅 — no built-in font on macOS or Android
    render(<Stage />);
    const rating = screen.getByTestId("stage-portability").textContent;
    expect(rating).toContain("✕ macOS: no font for 🞅");
    expect(rating).toContain("✕ Android: no font for 🞅");
  });
  it("shows a check when every glyph is built in", () => {
    render(<Stage />);
    expect(screen.getByTestId("stage-portability").textContent).toBe("✓ macOS✓ Android");
  });
  it("leaves the tab title alone while playing", () => {
    document.title = "Glypher";
    const { unmount } = render(<Stage />);
    expect(document.title).toBe("Glypher");
    unmount();
  });
});
