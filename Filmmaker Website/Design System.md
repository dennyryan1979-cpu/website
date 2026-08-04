# Denny Ryan — Website Design System

A quiet, editorial design system: paper white, Yves Klein blue, a single red accent, serif display type over monospace labels.

## Colour

| Role | Value | Usage |
|---|---|---|
| Background (paper) | `#F1EDE3` | Page background, header bg (at 92% opacity w/ blur) |
| Primary / ink | `#002FA7` (Yves Klein blue) | Body text, headings, borders, icons |
| Accent | `#E5231B` | Hover states, active links, italic emphasis words, selection highlight |
| Text on blue | `#F1EDE3` | Text/labels on solid blue fills (buttons, badges, selection) |

Blue is used at reduced opacity for secondary text and hairlines rather than a separate grey: `rgba(0,47,167,0.85)` body-secondary, `0.7` captions, `0.55` meta labels, `0.45`–`0.5` faint meta, `0.22`–`0.25` hairline borders/dividers.

Only two colours carry the whole site (blue + off-white) plus one red accent used sparingly — never more than the essential emphasis point per screen.

## Typography

- **Display / body serif:** `'Newsreader', Georgia, serif` — regular weight (400), italic used inline for emphasis (e.g. one word of a headline, titles of works). Headline sizes use `clamp()` for fluid scaling, e.g. `clamp(2.6rem, 6.2vw, 5.4rem)`, line-height ~1.04–1.15, letter-spacing slightly negative (`-0.018em`) at large sizes.
- **Label / mono:** `'Spline Sans Mono', monospace` — all-caps labels, nav items, meta text, index numbers, buttons. Small sizes (11–12px), wide letter-spacing (`0.18em`–`0.26em`).
- Body copy sits in serif at ~16–20px, line-height 1.5–1.9 for readability; mono is reserved for UI chrome/labels, never long-form paragraphs.

## Layout

- Max content width: `1180px`, centered, `32px` side padding (down to `22px` on mobile ≤700px).
- Sections separated by a `2px solid` blue top-rule + small mono eyebrow label + right-aligned mono meta (e.g. "SELECTED · 2019—2025").
- Index/list rows: CSS grid `54px 1fr auto` (index number / title / action), `1px solid rgba(0,47,167,0.22)` row dividers, generous vertical padding (~20px).
- Media (video/photo tiles): `1px solid #002FA7` border, blue-tinted placeholder/background, object-fit cover.
- Sticky header: translucent paper background + `backdrop-filter: blur(6px)`, bottom hairline border.

## Interaction

- Default link colour: inherit (blue); **hover → red** (`#E5231B`) — the consistent hover rule across nav, list rows, and buttons.
- Primary buttons: solid blue fill, off-white text, border blue; hover → solid red fill + red border.
- Selection (`::selection`): red background, off-white text.
- Index rows and cards use `cursor:pointer` with colour-only hover feedback — no shadows, no scale transforms.

## Voice / Motifs

- All-caps mono eyebrows label every section (FILM, PHOTOGRAPHY, CONTACT…) paired with a serif headline below, one word of which is often italic and coloured red.
- Numbered index lists (01, 02, 03…) for cataloguing work.
- No drop shadows, no rounded corners, no gradients beyond a subtle blue overlay on media for text legibility. Flat, hairline-bordered, high-contrast minimalism.

## Quick reference (CSS custom properties)

```css
:root {
  --bg: #F1EDE3;
  --ink: #002FA7;
  --accent: #E5231B;
  --ink-85: rgba(0,47,167,0.85);
  --ink-70: rgba(0,47,167,0.7);
  --ink-55: rgba(0,47,167,0.55);
  --ink-22: rgba(0,47,167,0.22);
  --font-display: 'Newsreader', Georgia, serif;
  --font-mono: 'Spline Sans Mono', monospace;
}
```
