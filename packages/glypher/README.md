# @bjenk/glypher

Looping animations made of Unicode characters: a loading indicator like `✎✏✐✏`, or an animated browser-tab icon. No dependencies, about 3 kB gzipped.

Design a loop in the [Glypher editor](https://bjenk.com/glypher), then use it with one line.

## React and Next.js

```bash
npm install @bjenk/glypher
```

```tsx
import { GlyphLoop, GlyphFavicon } from "@bjenk/glypher";

<GlyphLoop frames="✎✏✐✏" speed={150} />           // plays in the page, like a spinner
<GlyphFavicon frames="▘▝▗▖" />                     // plays in the browser tab's icon
```

Both work in Next.js server and client components.

## Any site: HTML, Vue, Angular, site builders

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@bjenk/glypher@0/dist/element.js"></script>

<glyph-loop frames="✎✏✐✏" speed="150"></glyph-loop>
<glyph-favicon frames="▘▝▗▖"></glyph-favicon>
```

Or, with a bundler: `import "@bjenk/glypher/element";`.

## Options

| Prop / attribute | Default | |
|---|---|---|
| `frames` | (required) | The frames, as a string (see below) or, in React, an array of strings. Up to 64. |
| `speed` | `150` | Milliseconds per frame. |
| `durations` | | Per-frame milliseconds: `[100, 100, 400]` in React, `"100,100,400"` in HTML. Missing entries use `speed`. |
| `playing` | `true` | `false` pauses (`playing="false"` in HTML). A paused favicon puts your own icon back. |
| `label` | `"Loading"` | `GlyphLoop` only. What screen readers announce. |
| `size` | `"1em"` | `GlyphLoop` (React) only. Font size; the HTML element inherits it from CSS. |
| `font` | `system-ui, sans-serif` | `GlyphFavicon` only. The font used to draw the icon. |

**Frames as a string:** each character is a frame, so `"✎✏✐✏"` is four frames, and emoji, flags and skin tones stay whole. To use frames of several characters, separate them with spaces: `"ab cd"`.

Times are clamped to 16–10000 ms.

## Good to know

- **Fonts.** Glyphs draw with your visitors' fonts. A glyph their system has no font for shows as an empty box. The editor shows which glyphs are built into macOS and Android.
- **Motion.** Visitors who ask their system for reduced motion see the first frame, still.
- **Color and size.** `GlyphLoop` inherits the surrounding text color and font, so style it like text.
- **Favicons.** The favicon animates in Chrome, Edge and Firefox; Safari shows the first frame. It takes over your page's icon tags while playing and restores them when it stops.

## License

MIT © Bjenk
