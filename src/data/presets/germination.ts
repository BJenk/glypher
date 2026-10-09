import type { Animation } from "../../store/animation";

const CYCLE: number[] = [
  0x00b7, // · seed
  0x002e, // . dropped seed
  0x2038, // ‸ breaking soil
  0x1275, // ት shoot
  0x1279, // ቹ flower
  0x1278, // ቸ flower
  0x127b, // ቻ stem
  0x1290, // ነ leaves
  0x1276, // ቶ fading
  0x1348, // ፈ crown
];

export const GERMINATION: Animation = {
  version: 1,
  loop: true,
  speedMs: 240,
  background: "#ffffff",
  ink: "#111111",
  frames: CYCLE.map((cp, i) => ({ id: `g${i + 1}`, cp })),
};
