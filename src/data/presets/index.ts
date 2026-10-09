import type { Animation } from "@/store/animation";
import { GERMINATION } from "./germination";

// "Loading 1" — Ogham strokes building up one to five: ᚋᚌᚍᚎᚏ
const LOADING_1: Animation = {
  version: 1,
  loop: true,
  speedMs: 150,
  background: "#ffffff",
  ink: "#111111",
  frames: [0x168b, 0x168c, 0x168d, 0x168e, 0x168f].map((cp, i) => ({ id: `l${i + 1}`, cp })),
};

// "Loading 2" — tone letters stepping from extra-high to extra-low: ˥˦˧˨˩
const LOADING_2: Animation = {
  ...LOADING_1,
  frames: [0x02e5, 0x02e6, 0x02e7, 0x02e8, 0x02e9].map((cp, i) => ({ id: `t${i + 1}`, cp })),
};

// "Loading 3" — circled digits counting one to ten: ①②③④⑤⑥⑦⑧⑨⑩
const LOADING_3: Animation = {
  ...LOADING_1,
  frames: Array.from({ length: 10 }, (_, i) => ({ id: `n${i + 1}`, cp: 0x2460 + i })),
};

// "Loading 4" — a quadrant block circling clockwise: ▘▝▗▖
const LOADING_4: Animation = {
  ...LOADING_1,
  frames: [0x2598, 0x259d, 0x2597, 0x2596].map((cp, i) => ({ id: `q${i + 1}`, cp })),
};

// "Loading 5" — a bar rising in eighths: ▁▂▃▄▅▆▇
const LOADING_5: Animation = {
  ...LOADING_1,
  frames: Array.from({ length: 7 }, (_, i) => ({ id: `b${i + 1}`, cp: 0x2581 + i })),
};

// "Loading 6" — braille dots filling up a cell: ⢀⢠⢰⢸⣸⣼⣾⣿
const LOADING_6: Animation = {
  ...LOADING_1,
  frames: [0x2880, 0x28a0, 0x28b0, 0x28b8, 0x28f8, 0x28fc, 0x28fe, 0x28ff].map((cp, i) => ({ id: `d${i + 1}`, cp })),
};

// "Loading 7" — Meroitic cursive hundreds counting up and back: 𐧒𐧓𐧔𐧕𐧔𐧔𐧓𐧒
const LOADING_7: Animation = {
  ...LOADING_1,
  frames: [0x109d2, 0x109d3, 0x109d4, 0x109d5, 0x109d4, 0x109d4, 0x109d3, 0x109d2].map((cp, i) => ({ id: `m${i + 1}`, cp })),
};

// "Loading 8" — clock faces ticking through the hours: 🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚🕛
const LOADING_8: Animation = {
  ...LOADING_1,
  frames: Array.from({ length: 12 }, (_, i) => ({ id: `c${i + 1}`, cp: 0x1f550 + i })),
};

// "Loading 9" — the eight I Ching trigrams in order: ☰☱☲☳☴☵☶☷
const LOADING_9: Animation = {
  ...LOADING_1,
  frames: Array.from({ length: 8 }, (_, i) => ({ id: `y${i + 1}`, cp: 0x2630 + i })),
};

// "Loading 10" — a pencil rocking as it writes: ✎✏✐✏
const LOADING_10: Animation = {
  ...LOADING_1,
  frames: [0x270e, 0x270f, 0x2710, 0x270f].map((cp, i) => ({ id: `p${i + 1}`, cp })),
};

// "Loading 11" — the letter A dressed in different enclosures: 🄰🅐🅰🄐🇦A
const LOADING_11: Animation = {
  ...LOADING_1,
  frames: [0x1f130, 0x1f150, 0x1f170, 0x1f110, 0x1f1e6, 0x41].map((cp, i) => ({ id: `e${i + 1}`, cp })),
};

// "Loading 12" — scissors snipping: ✁✂✃✂
const LOADING_12: Animation = {
  ...LOADING_1,
  frames: [0x2701, 0x2702, 0x2703, 0x2702].map((cp, i) => ({ id: `x${i + 1}`, cp })),
};

// "Loading 13" — join symbols swinging between left, full and right: ⟕⟗⟖⟗
const LOADING_13: Animation = {
  ...LOADING_1,
  frames: [0x27d5, 0x27d7, 0x27d6, 0x27d7].map((cp, i) => ({ id: `j${i + 1}`, cp })),
};

// "Loading 14" — a bowtie filling one side, then the other: ⧑⧓⧑⧓⧒⧓⧒⧓
const LOADING_14: Animation = {
  ...LOADING_1,
  frames: [0x29d1, 0x29d3, 0x29d1, 0x29d3, 0x29d2, 0x29d3, 0x29d2, 0x29d3].map((cp, i) => ({ id: `b${i + 1}`, cp })),
};

// "Loading 15" — bracket pieces tracing a loop around a tall paren: ⎛⎝⎜⎠⎞⎠⎜⎝
const LOADING_15: Animation = {
  ...LOADING_1,
  frames: [0x239b, 0x239d, 0x239c, 0x23a0, 0x239e, 0x23a0, 0x239c, 0x239d].map((cp, i) => ({ id: `h${i + 1}`, cp })),
};

export type Example = {
  id: string;
  name: string;
  description?: string;
  animation: Animation;
};

export const EXAMPLES: Example[] = [
  {
    id: "germination",
    name: "Germination",
    description: "A seed sprouting, blooming and wilting — the piece that started Glypher.",
    animation: GERMINATION,
  },
  {
    id: "loading-1",
    name: "Loading 1",
    description: "Ogham strokes building up one to five, like a loading indicator.",
    animation: LOADING_1,
  },
  {
    id: "loading-2",
    name: "Loading 2",
    description: "Tone letters stepping from extra-high to extra-low, like a loading indicator.",
    animation: LOADING_2,
  },
  {
    id: "loading-3",
    name: "Loading 3",
    description: "Circled digits counting from one to ten.",
    animation: LOADING_3,
  },
  {
    id: "loading-4",
    name: "Loading 4",
    description: "A quadrant block circling clockwise.",
    animation: LOADING_4,
  },
  {
    id: "loading-5",
    name: "Loading 5",
    description: "A bar rising one eighth at a time.",
    animation: LOADING_5,
  },
  {
    id: "loading-6",
    name: "Loading 6",
    description: "Braille dots filling up a cell one by one.",
    animation: LOADING_6,
  },
  {
    id: "loading-7",
    name: "Loading 7",
    description: "Meroitic cursive numerals counting up and back down.",
    animation: LOADING_7,
  },
  {
    id: "loading-8",
    name: "Loading 8",
    description: "Clock faces ticking from one o'clock round to twelve.",
    animation: LOADING_8,
  },
  {
    id: "loading-9",
    name: "Loading 9",
    description: "The eight I Ching trigrams, from heaven to earth.",
    animation: LOADING_9,
  },
  {
    id: "loading-10",
    name: "Loading 10",
    description: "A pencil rocking back and forth as it writes.",
    animation: LOADING_10,
  },
  {
    id: "loading-11",
    name: "Loading 11",
    description: "The letter A in square, circle, filled and bracketed frames, then plain.",
    animation: LOADING_11,
  },
  {
    id: "loading-12",
    name: "Loading 12",
    description: "Scissors opening and closing as they snip.",
    animation: LOADING_12,
  },
  {
    id: "loading-13",
    name: "Loading 13",
    description: "Outer join symbols swinging from left, through full, to right.",
    animation: LOADING_13,
  },
  {
    id: "loading-14",
    name: "Loading 14",
    description: "A bowtie blinking twice on its left side, then twice on its right.",
    animation: LOADING_14,
  },
  {
    id: "loading-15",
    name: "Loading 15",
    description: "Pieces of a tall parenthesis hooking left, then right, and back.",
    animation: LOADING_15,
  },
];
