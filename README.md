# Glypher

Glypher makes looping animations out of Unicode characters: a seed sprouting from Ethiopic syllables, a pencil rocking with `✎✏✐✏`, a clock ticking through `🕐🕑🕒`. You pick characters, put them in order, and copy out a ready-made loading indicator or an animated browser-tab icon for your own site.


<!-- Screenshot or GIF of the editor goes here, e.g. docs/glypher.gif -->

## Why

The idea started with one animation, a germination sequence built from Ethiopic letters that look like a seed, a shoot and a flower. Making it by hand meant searching code charts for lookalike glyphs and then finding out which of them other people's computers could display at all. Glypher handles both problems: a searchable picker for all ~40,000 named Unicode characters, and a check of which operating systems can draw each one with the fonts they ship.

## Features

- **Glyph picker.** Search every named Unicode character by name (`snowflake`, `katakana ka`), by code point (`U+2744`, `0x2744`, `10052`), or by pasting the character. The list is virtualized, so all of it scrolls smoothly without a library.
- **Portability ranking.** Glyphs are grouped by how safe they are to use: first those built into every measured platform, then those built into only some. The ranking comes from measured font coverage, not guesses (see [Portability data](#portability-data)).
- **Timeline.** Click glyphs to add frames, then drag to reorder or remove them. The stage plays the loop as you edit, with adjustable speed.
- **Platform check.** For the current loop, the editor lists any glyph that macOS or Android can't draw.
- **Live tab preview.** The loop can play in the browser tab's favicon while you work. It uses the same component you install, so the preview is exactly what visitors get.
- **Use it.** Add the loop to any site with the [`@bjenk/glypher`](packages/glypher) package: `<GlyphLoop frames="✎✏✐✏" />` in React or Next.js, or the `<glyph-loop>` web component anywhere else. Either can also animate the browser tab's icon. Glypher hands you a component tag and your frames, not generated code.
- **Examples.** Sixteen built-in loops play in the header; click one to load it.
- **Autosave.** Your work is saved in the browser and restored when you come back.

## Tech

Next.js 14 (App Router), React 18, TypeScript, Zustand and CSS Modules, tested with Vitest and Testing Library. Glyphs render with a stack of bundled Noto fonts, so most previews look the same on any machine.

## Repository layout

- `src/`: the Glypher editor (Next.js), the page at bjenk.com/glypher.
- `packages/glypher/`: [`@bjenk/glypher`](packages/glypher), the small runtime published to npm. The editor uses it for its tab preview, and its "Use it" panel produces snippets for it.

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:3000
npm test          # Vitest suite
npm run build     # production build
npm run typecheck # types, editor and runtime
npm run build:lib # build the runtime package into packages/glypher/dist
```

The character names and coverage data are generated from files in `vendor/` into `src/lib/unicode/generated/`, which is committed. `npm run build` regenerates them; to do it alone, run `npm run unicode:build`.

## Portability data

The picker ranks glyphs using measured font coverage in `vendor/coverage/<platform>.json`. Each file lists the code points that a stock install's built-in fonts cover. macOS and Android are measured so far; any platform with a file in that folder is picked up automatically.

To re-measure a platform:

```bash
# macOS (needs: pip install fonttools brotli)
python scripts/coverage/dump_cmaps.py macos macOS "macOS 26.6" /System/Library/Fonts

# Android: downloads the fonts AOSP ships, then measures them
python scripts/coverage/fetch_android_fonts.py /tmp/android-fonts
python scripts/coverage/dump_cmaps.py android Android "Android (AOSP main)" /tmp/android-fonts

# Windows: run on a stock Windows PC, no installs needed
powershell -ExecutionPolicy Bypass -File scripts\coverage\dump-windows.ps1
```

Then run `npm run unicode:build`.

## License

The editor is copyright © 2026, all rights reserved. Its source is published for viewing as portfolio work; see [LICENSE](LICENSE). The runtime package in `packages/glypher/` is MIT licensed, so you can use it in anything. Anything you make with Glypher is yours to use freely.

Character names come from the [Unicode Character Database](https://www.unicode.org/ucd/) (Unicode License v3).
