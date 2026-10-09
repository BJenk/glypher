// The "Glypher" wordmark, one loop per letter. A letter with no frames yet
// stays as plain text. Frames are lookalike glyphs from across Unicode.
export type TitleLetter = { letter: string; frames: string[] };

export const TITLE: TitleLetter[] = [
  { letter: "G", frames: ["G", "Ǧ", "Ǵ", "໒", "Ⴚ"] },
  { letter: "l", frames: ["Ⳑ", "ⳑ", "┗", "Ḷ", "ᒪ"] },
  { letter: "y", frames: ["Y", "ƴ", "Ƴ", "ᚴ", "Ⲩ", "ⲩ", "ㆩ"] },
  { letter: "p", frames: ["P", "ዋ", "Ꮾ", "Ꮲ"] },
  { letter: "h", frames: ["𐪘", "H"] },
  { letter: "e", frames: ["E", "Ǝ", "Э", "ᄐ"] },
  { letter: "r", frames: ["R", "Ɽ", "ꝶ", "𐊯", "𐒴"] },
];

export const TITLE_SPEED_MS = 420;
