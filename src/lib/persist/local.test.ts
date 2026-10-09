import { describe, it, expect, beforeEach } from "vitest";
import { saveLocal, loadLocal } from "./local";
import { createInitialAnimation } from "../../store/animation";

beforeEach(() => localStorage.clear());

describe("local persistence", () => {
  it("saves and loads", () => {
    const a = createInitialAnimation();
    a.frames.push({ id: "f1", cp: 65 });
    saveLocal(a);
    expect(loadLocal()).toEqual(a);
  });
  it("returns null when empty", () => {
    expect(loadLocal()).toBeNull();
  });
});
