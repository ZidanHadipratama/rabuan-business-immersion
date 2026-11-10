# Rabuan deck v2: design system

Corporate consulting deck in the manner of the PT Semen Indonesia Business Immersion deck (`../PPT BI SIG.pdf`), dressed in Pertamina Patra Niaga identity. Static and dense, read on a projector in a lit room. Replaces v1 (3D/GSAP, rejected; see `archive/`).

## What is borrowed from the SIG reference
- White ground, bold sentence-case title top-left, one-line lede under it in the brand colour, logo top-right.
- Dark label bars with a chevron end over each panel; big coloured figures with a grey caption; red numbered circles for steps; one highlighted card (red outline + tint) per slide.
- Section dividers: big section mark + title on white, a BI photo cut on a diagonal on the right.
- Bottom-left tagline, italic-free source line on every content slide, tri-colour bar along the bottom, page number in a corner triangle.
- Closing: full-bleed group photo with "Terima kasih" on the sky.

## Pertamina Patra Niaga translation
| Token | Value | Role |
|---|---|---|
| `--navy` | `#05416D` | Label bars, page triangle, table heads (pertaminapatraniaga.com) |
| `--blue` / `--blue-text` | `#086DB5` / `#0762A3` | Logo blue; ledes and figures; section A |
| `--red` / `--red-text` / `--red-tint` | `#EA1E30` / `#C41425` / `#FDEDEF` | Logo red; step circles, the one highlighted card, key figure; section C |
| `--green` / `--green-text` | `#AAC237` / `#5E6F12` | Logo green; tri-bar, section B |
| `--ink` `--ink-2` `--ink-3` | `#0F172A` `#334155` `#5B6B80` | Three text roles |
| `--panel` | `#F1F5F9` | Card ground |

- Signature: three slanted stripes (red, green, blue) at the logo's slant along the photo cut on cover and dividers; tri-colour bar (blue 2 : green 1 : red 1) on every slide.
- Tagline "Energizing Your Journey" (from PPN's own "Our Business Process" slide via Kel 13).
- Type: Rethink Sans (pertaminapatraniaga.com), titles 700 at 52px, lede 500 at 26px, body 19–22px; JetBrains Mono only for codes, source codes (S01…), months and KPI targets. `calt`, `liga`, `dlig` off: Rethink Sans turns "(R)" into ®.
- Icons: Tabler outline, inlined at build.

## Layout
- 1920×1080 stage scaled to the window. Gutter 96. Title at y 56; body box top 252, bottom 132; footer at bottom 34.
- `.body` is absolutely positioned; never give it `height: 100%` (it becomes 1080 tall). Grids that hold photos need `grid-template-rows: minmax(0, 1fr)`.

## Motion
- One entrance per visit: `[data-a]` children fade and rise 18px, 70 ms stagger, curve cubic-bezier(.2,0,0,1). Slides crossfade 350 ms. No 3D, no loops. Reduced motion and `?print` show final state.

## Rules
- Every number has its group and source on the slide; disagreeing numbers are shown side by side, never harmonised.
- Photos are the participants' BI photos only. No generated imagery (13.4 is a Gemini image and is not used as a picture).
