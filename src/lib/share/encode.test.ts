import { describe, it, expect } from "vitest";
import { encodeAnimation, decodeAnimation } from "./encode";
import { createInitialAnimation } from "../../store/animation";

describe("share encode", () => {
  it("round-trips an animation", () => {
    const a = createInitialAnimation();
    a.frames.push({ id: "f1", cp: 0x3a8, color: "#fff" });
    a.speedMs = 111;
    const decoded = decodeAnimation(encodeAnimation(a));
    expect(decoded).toEqual(a);
  });
  it("returns null on garbage", () => {
    expect(decodeAnimation("!!!not-valid!!!")).toBeNull();
  });
  it("returns null on wrong version", () => {
    const a = { ...createInitialAnimation(), version: 999 } as unknown as ReturnType<typeof createInitialAnimation>;
    expect(decodeAnimation(encodeAnimation(a as any))).toBeNull();
  });
});
