import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timeline } from "./Timeline";
import { useAnimation } from "@/store/animation";

beforeEach(() => {
  useAnimation.getState().clear();
  useAnimation.getState().addFrame(0x3a8); // Ψ
  useAnimation.getState().addFrame(0x1200); // ሀ
});

describe("Timeline", () => {
  it("renders a card per frame with the glyph", () => {
    render(<Timeline />);
    expect(screen.getByText("Ψ")).toBeTruthy();
  });
  it("deletes a frame", async () => {
    render(<Timeline />);
    const del = screen.getAllByRole("button", { name: "✕" })[0];
    await userEvent.click(del);
    expect(useAnimation.getState().animation.frames).toHaveLength(1);
  });
  it("reorders by dragging a card onto another", () => {
    render(<Timeline />);
    const dataTransfer = { setData: () => {}, effectAllowed: "" };
    fireEvent.dragStart(screen.getByText("Ψ"), { dataTransfer });
    const target = screen.getByText("ሀ");
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual([0x1200, 0x3a8]);
  });
  it("has no step-reorder buttons", () => {
    render(<Timeline />);
    expect(screen.queryByRole("button", { name: "◀" })).toBeNull();
    expect(screen.queryByRole("button", { name: "▶" })).toBeNull();
  });
});
