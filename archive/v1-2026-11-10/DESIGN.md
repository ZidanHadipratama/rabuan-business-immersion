# Rabuan deck: design system

Pertamina Patra Niaga terminal at midday, presented on a projector in a lit room.

## Colour
| Token | Value | Source / role |
|---|---|---|
| `--red` | `#EA1E30` | Logo red (official PPN SVG). One figure or accent per slide; section C marker |
| `--blue` | `#086DB5` | Logo blue. Section A marker, capacity figures |
| `--green` | `#AAC237` | Logo green. Section B field; text version `--sec-b #5E6F12` (5.3:1 on paper) |
| `--navy` | `#05416D` | pertaminapatraniaga.com. Photo/3D slides, section D, emphasis panels |
| `--ink` / `--ink-2` / `--ink-3` | `#0F172A` / `#334155` / `#5B6B80` | pertaminapatraniaga.com neutrals. Three text roles |
| `--paper` / `--paper-2` | `#F8FAFC` / `#F1F5F9` | Working-slide ground |
| `--red-text` | `#C41425` | Red for small text (5.8:1) |
| Fuel dyes | `#2FA84F` `#1E6FD9` `#D9232F` | Pertalite, Pertamax, Pertamax Turbo (GridOto 2021). Only inside the tank |

Light ground for working slides (lit room); navy only where a photo or 3D model leads.

## Type
- Rethink Sans 400–700 (the face pertaminapatraniaga.com ships), self-hosted in `fonts/`.
- JetBrains Mono 500/700 for measured numbers, codes (A1…D4), timers. Not for prose.
- Scale on the 1920×1080 stage: h1 112, h2 60, h3 27, body 22, lede 28, source 16. Tracking −0.028em on h2, −0.035em on h1.
- `calt` off: Rethink Sans turns "(R)" into ®.

## Layout
- Stage 1920×1080, scaled to fit; gutter 112 px; title block at y 64 with a 120 px ink rule that grows first (#005).
- Slide code chip (A1, C2…) sits on the title line in the section colour. No kickers above headings.
- Footer: section · group left, page number right; sources line above it on every content slide.
- Dividers: section colour fills 54% of the slide, a real BI photo fills the rest.

## Icons
Tabler outline (the set pertamina.com loads), inlined at build from `node_modules/@tabler/icons`, stroke 1.75.

## Motion (Corporate personality)
- Signature curve `sig` = cubic-bezier(0.2, 0, 0, 1); entrances `emph` (0.05, 0.7, 0.1, 1); exits `exit` (0.3, 0, 1, 1).
- Durations: 0.3 / 0.6 / 1.1 s. Stagger 0.1–0.14 s. One primary move per step.
- Ported Motion Prompt elements: #005 mask reveal (titles), #007 count-up (figures), #002 stagger (bars, Gantt; overshoot softened to back-out 1.2), #004 line draw (chains, RCA arrows), #044 cross dissolve (photo → 3D), #028 zoom (hook photo push, 1.16× over 13 s), #164 countdown (hook timer), #126 motion path (truck sprite on the journey map and value chain).
- Rigid objects (truck, tanks) never overshoot; liquid fills use a 1.4 s fill with a small settle.
- `prefers-reduced-motion`: entrances jump to their end state.

## 3D
- One shared WebGL renderer; the canvas moves into the active slide.
- Tank truck modelled from Wikimedia Commons V034 (side proportions) and BI photos DSCF2614/2387 (livery, rear markings). Answer-slide start camera fitted to DSCF2614 by `scripts/fitcam.mjs` (17 px RMS).
- Terminal scene is a labelled schematic, not a site plan.

## Rules
- Every number, quote and image has a source on the slide and in SOURCES.md. Where groups disagree, show each with its source.
- Photos are the participants' own BI photos or Commons files; no generated imagery.
