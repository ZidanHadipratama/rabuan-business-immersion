---
name: Rabuan ALP deck
description: Business Immersion deck for PT Pertamina Patra Niaga, Integrated Terminal Jakarta, in the SIG consulting-deck grammar
colors:
  logo-red: "#EA1E30"
  red-ink: "#C41425"
  red-wash: "#FDEDEF"
  logo-blue: "#086DB5"
  blue-ink: "#0762A3"
  blue-wash: "#E8F1F9"
  logo-green: "#AAC237"
  green-ink: "#5E6F12"
  green-wash: "#F3F7E3"
  terminal-navy: "#05416D"
  ink: "#0F172A"
  ink-2: "#334155"
  ink-3: "#5B6B80"
  panel: "#F1F5F9"
  paper: "#FFFFFF"
typography:
  display:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "104px"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  section-mark:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "240px"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.32
  figure:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\" 1"
  title:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.4
  label-bar:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "23px"
    fontWeight: 600
  source:
    fontFamily: "Rethink Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.35
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1
rounded:
  none: "0px"
  level: "4px"
  pin: "6px"
spacing:
  gap-xs: "8px"
  gap-sm: "12px"
  gap-md: "22px"
  gap-lg: "36px"
  gap-xl: "48px"
  gutter: "96px"
components:
  label-bar:
    backgroundColor: "{colors.terminal-navy}"
    textColor: "{colors.paper}"
    typography: "{typography.label-bar}"
    rounded: "{rounded.none}"
    height: "50px"
    padding: "0 40px 0 24px"
  label-bar-root:
    backgroundColor: "{colors.red-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label-bar}"
    height: "50px"
  step-circle:
    backgroundColor: "{colors.logo-red}"
    textColor: "{colors.paper}"
    size: "46px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
    padding: "24px 28px"
  card-highlight:
    backgroundColor: "{colors.red-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "22px 26px"
  photo-caption:
    backgroundColor: "{colors.terminal-navy}"
    textColor: "{colors.paper}"
    padding: "8px 14px"
  level-high:
    backgroundColor: "{colors.logo-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.level}"
    padding: "5px 12px"
  level-medium:
    backgroundColor: "#CBD5E1"
    textColor: "{colors.ink}"
    rounded: "{rounded.level}"
    padding: "5px 12px"
---

# Design System: Rabuan ALP deck

## Overview

**Creative North Star: "Satu Rit BBM"**

The deck is one fuel run from terminal to customer, and the tank truck's sealed compartments are the organising idea: four groups, one truck, one route A → D. The room follows the run: know the company, see the field, find the problem, change it. It refuses the corporate template of title, bullet list and stock icon per slide.

The grammar is borrowed from the PT Semen Indonesia Business Immersion deck (`../PPT BI SIG.pdf`) and dressed in Pertamina Patra Niaga identity: a white ground, dense corporate slides read on a projector in a lit meeting room, and real BI photos as evidence. v1 (3D/GSAP, rejected; see `archive/`) is the anti-reference: no 3D, no ambient loops, no spectacle that competes with the numbers.

Motion builds the argument one click at a time, so the presenter reveals a slide the way the run unfolds: the vehicle first, then what it carries, then the one thing that matters, drawn last in red.

**Key Characteristics:**
- White 1920×1080 stage, bold sentence-case title top-left, blue lede under it, logo top-right
- Navy label bars with a chevron end; big coloured figures with a grey caption; red numbered circles for steps
- One highlighted card per slide (red outline on red wash), and it always arrives last
- Every content slide ends in the same footer: tagline, source line, slide code, tri-colour bar, page triangle
- Real participant photos for evidence; labelled isometric illustrations only where no photo exists

## Colors

Three logo colours on white and tinted slate neutrals, each colour with a job; navy carries the structure.

### Primary
- **Logo Red** (#EA1E30): step circles, the one highlighted card's outline, high-level badges, the red third of the tri-bar. Section C.
- **Red Ink** (#C41425): red used as text on white (key figures, highlight headings, root-cause bars), where Logo Red would miss contrast.
- **Red Wash** (#FDEDEF): ground of the highlighted card and the focus stage only.

### Secondary
- **Logo Blue** (#086DB5): figure accents, nodes, Gantt bars, the blue half of the tri-bar. Section A.
- **Blue Ink** (#0762A3): ledes, most big figures, blue text on white.
- **Blue Wash** (#E8F1F9): "to be" cells, facility chips, KPI target cells.

### Tertiary
- **Logo Green** (#AAC237): the green quarter of the tri-bar and the middle stripe; never text.
- **Green Ink** (#5E6F12): section B mark and its accents as text.
- **Green Wash** (#F3F7E3): the draft note on divider B.

### Neutral
- **Terminal Navy** (#05416D): label bars, table heads, photo captions, page triangle, the D4 value card (pertaminapatraniaga.com).
- **Ink** (#0F172A): titles and emphasis.
- **Ink 2** (#334155): body text.
- **Ink 3** (#5B6B80): captions, source lines, mono codes, icons in stat lists.
- **Panel** (#F1F5F9): card ground.
- **Paper** (#FFFFFF): slide ground. Hairlines are Ink at 10% (`rgba(15, 23, 42, .10)`).

### Named Rules
**The One Red Card Rule.** Each slide has at most one red-outlined card, and it carries the slide's conclusion.
**The Section Colour Rule.** A = blue, B = green ink, C = red, D = navy; the colour marks the section, not decoration.

## Typography

**Display Font:** Rethink Sans (with system-ui), as on pertaminapatraniaga.com
**Body Font:** Rethink Sans
**Label/Mono Font:** JetBrains Mono, only for codes, source codes (S01…), months and KPI targets

**Character:** one confident grotesque doing every job through size and weight; the mono appears only where something is measured or coded.

### Hierarchy
- **Display** (700, 104px, 0.98): cover title and "Terima kasih" only.
- **Section mark** (800, 240px, 0.8): the A–D letter on dividers, in the section colour.
- **Headline** (700, 52px, 1.08): slide titles, balanced, at most two lines.
- **Lede** (500, 26px, 1.32): one line in Blue Ink under the title.
- **Figure** (700, 46–92px, 1, tabular): big numbers; 60px default.
- **Title** (700, 21–28px, 1.2): card and column heads.
- **Body** (400, 18–22px, 1.35–1.4): card text; never below 18px except captions and sources.
- **Source** (400, 15px, 1.35): footer source line in Ink 3, bold label in Ink 2.

### Named Rules
**The ® Rule.** `calt`, `liga` and `dlig` stay off: Rethink Sans turns "(R)" into ®.
**The Indonesian Number Rule.** Thousands use a dot (4.137), decimals a comma (1,2×); counters keep that format while they run.

## Layout

A 1920×1080 stage scaled to the window. Gutter 96px. Title at y 56; body box from top 252 to bottom 132; footer at bottom 34. Logo 236px wide at right 92, top 60.

Content grids use 10–48px gaps, wider between groups than inside them. `.body` is absolutely positioned: never give a class on it `height: 100%` (it becomes 1080 tall). Grids that hold photos need `grid-template-rows: minmax(0, 1fr)` so photos fill without overflowing.

Dividers and cover: text block at left 96, a photo cut on the logo's diagonal on the right (clip polygon from 30–34% at the top to 0% at the bottom), three slanted stripes along the cut. The closing slide is a full-bleed group photo.

## Elevation & Depth

Flat by default: depth comes from the panel ground against white and from photos. Two small neutral shadows exist, both functional.

### Shadow Vocabulary
- **Step lift** (`box-shadow: 0 2px 6px rgba(15, 23, 42, .18)`): red step circles, so they read on photos and panels.
- **Pin label** (`box-shadow: 0 2px 10px rgba(15, 23, 42, .18)`): white labels pinned on illustrations.

### Named Rules
**The Inset Outline Rule.** Highlight is an inset 3px red outline (`inset 0 0 0 3px`), never a glow or a drop shadow.

## Shapes

Square corners everywhere: cards, bars, photos and tables are 0px. Shape comes from cuts, not radius: label bars end in a 20px chevron, root-cause cells point right, dividers cut the photo on the logo's 17.4° slant. Circles are kept for step numbers and network nodes. The only radii are the 4px impact-level badge and the 6px right end of a pin label.

## Components

### Label bars
- **Shape:** 50px tall navy bar with a 20px chevron end (flat variant without the point).
- **Use:** over every panel and column; Red Ink variant for "Akar masalah"; slate variants for upstream stages.

### Step circles
- **Shape:** 46px circle (36px small), Logo Red, white tabular numeral, step lift shadow.
- **Variants:** navy for context steps, slate (#94A3B8) for medium-level items.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** Panel; highlight card on Red Wash with the inset red outline.
- **Internal Padding:** 16–28px depending on density.

### Figures
- **Style:** big tabular number in Blue Ink (Red Ink for the key one) with a 21px Ink 2 caption under it; unit in `small` at half size.

### Photos
- **Style:** cover-cropped participant photo with a navy caption block bottom-left (17px white).
- **Illustrations:** Codex isometric renders on white, `mix-blend-mode: multiply`, always captioned "ilustrasi, bukan skala"; numbered pins or figure labels with a fading leader line mark the parts.

### Footer
- **Style:** tagline "Energizing Your Journey" (17px navy bold), source line, mono slide code, tri-colour bar (blue 2 : green 1 : red 1, 10px), navy page triangle.

### Build motion (signature)
- **Engine:** GSAP 3 core (`vendor/gsap.min.js`, offline), one paused timeline per slide. `[data-a]` marks a part of the build, `data-s="n"` the click that reveals it (0 = on arrival), `data-fx` how it enters (rise, left, fade, wipe, photo, photos, kids, slash, stripes, push, none).
- **Controls:** → / space / click reveals the next build, then moves on; ← steps back one build; ↓ ↑ skip whole slides; progress dots sit above the tri-bar; `#n.k` opens slide n with k builds shown.
- **Inner motion from class names:** `.fig` numbers count up in Indonesian format; `.pin` and `.fp` labels pop in order; Gantt bars and `.tl-line` rules grow from the left; `[data-draw]` paths draw, `[data-wipe]` dashed paths wipe; wheel `.seg` sweep in; the highlight card draws its outline last.
- **Focal moment:** cover and dividers open the photo along the logo slant from the right edge, stripes drop in, then the text. The closing photo pushes in slowly.
- **Timing:** expo.out for arrivals, expo.inOut for wipes and lines; .5s small parts, .8s blocks, 1.2s photos, lines and counters; 90ms stagger. Reduced motion keeps builds as .3s fades; `?print` skips GSAP and shows everything.

## Do's and Don'ts

### Do:
- **Do** put every number's group and source on the slide; show disagreeing numbers side by side, never harmonised.
- **Do** use participants' BI photos as evidence; use a labelled illustration only for a concept no photo shows.
- **Do** keep one red highlight card per slide and let it land last in the build.
- **Do** keep the footer (tagline, source, code, tri-bar, page triangle) on every content slide.
- **Do** use Tabler outline icons, inlined at build, in the text colour of their role.

### Don't:
- **Don't** use 3D, ambient loops or bouncy easing; v1 was rejected for exactly that.
- **Don't** show 13.4's Gemini image or any generated image as if it were a photo.
- **Don't** give `.body` or a class on it `height: 100%`.
- **Don't** round cards or bars; shape comes from chevrons and diagonal cuts.
- **Don't** set body text below 18px; only captions and source lines go smaller.
