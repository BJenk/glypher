import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExampleStrip } from "./ExampleStrip";
import { EXAMPLES } from "@/data/presets";
import { useAnimation } from "@/store/animation";

beforeEach(() => useAnimation.getState().clear());

describe("ExampleStrip", () => {
  it("shows every example as its own tile", () => {
    render(<ExampleStrip />);
    expect(screen.getAllByRole("button", { name: /^Load / })).toHaveLength(EXAMPLES.length);
  });
  it("loads an example when its tile is clicked", async () => {
    render(<ExampleStrip />);
    await userEvent.click(screen.getByRole("button", { name: "Load Loading 9" }));
    expect(useAnimation.getState().animation.frames.map((f) => f.cp)).toEqual(
      [0x2630, 0x2631, 0x2632, 0x2633, 0x2634, 0x2635, 0x2636, 0x2637],
    );
  });
});
