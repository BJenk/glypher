import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { useAnimation } from "@/store/animation";
import { encodeAnimation } from "@/lib/share/encode";
import { saveLocal } from "@/lib/persist/local";

beforeEach(() => {
  localStorage.clear();
  useAnimation.getState().clear();
  window.location.hash = "";
});

describe("App", () => {
  it("loads the germination example", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Load Germination" }));
    expect(useAnimation.getState().animation.frames.length).toBeGreaterThan(5);
  });

  it("autosaves to localStorage when frames change", async () => {
    render(<App />);
    useAnimation.getState().addFrame(0x3a8);
    await waitFor(() => expect(localStorage.getItem("glypher:v1")).toContain("936"));
  });

  it("URL hash hydration wins over localStorage", async () => {
    // Build an animation with an Ethiopic glyph and encode it into the hash
    const { createInitialAnimation } = await import("@/store/animation");
    const hashAnim = {
      ...createInitialAnimation(),
      frames: [{ id: "f-hash", cp: 0x1275, color: undefined, durationMs: undefined }],
    };
    const encoded = encodeAnimation(hashAnim);

    // Seed different data into localStorage so we can confirm hash wins
    const localAnim = {
      ...createInitialAnimation(),
      frames: [{ id: "f-local", cp: 0x3a8, color: undefined, durationMs: undefined }],
    };
    saveLocal(localAnim);

    // Set hash BEFORE render so the hydration effect sees it
    window.location.hash = "#" + encoded;

    render(<App />);

    await waitFor(() => {
      const frames = useAnimation.getState().animation.frames;
      expect(frames.length).toBe(1);
      expect(frames[0].cp).toBe(0x1275); // from hash, not localStorage (0x3a8)
    });
  });
});
