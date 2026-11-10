# Log

[progress] 2026-11-10 · B5 illustrations (Codex)
- Task: user asked for Codex-generated images to support the presentation.
- Files: assets/illus/{queue,stock,hoax}.jpg (Codex, trimmed, whites levelled), src/index.src.html (B5 cards 01–03 get one strip each, captioned ilustrasi), index.html, SOURCES.md, PDF.
- Verification: slide 13 captured at 1920x1080, no overlap; PDF 26 pages.
- Next: user review.

[progress] 2026-11-10 · Deck v3.1 (branch modifikasi-2, worktree Rabuan-modifikasi-2): user fixes + Kel 9 rework
- Task: copy Rabuan-modifikasi as a new branch and fix four points from the user.
- Files: src/index.src.html, index.html, SOURCES.md, docs/log.md.
- Changes: (1) slide 4 A1 fleet: figures moved to a row under the illustration, each centred on its asset (kapal, pipa, gerbong, MT BBM, MT LPG) with a tick and dot; image top whitespace cropped, caption moved top right. (2) Section B rebuilt from Kel 9's own decks 9-1 and 9-2 (uploaded 10 Nov): B1 five nodes with input/process/output + 2025 sales mix, B2 six technical stages + New Gantry System parameters, B3 six-actor refill cycle + hierarchy + coordination + three points where SPBU runs dry, B4 ITJ figures + F1–F4, new B5 findings 01–03, synthesis and four recommendations; "draf" labels removed; divider, agenda and Sources updated. Deck is now 26 slides (D1 moved from 19 to 20). (3) D1 timeline: one year per click (2015, 2021, 2023, 2026, Berjalan), gaps on click 6. (4) Closing photo: bi2505 (group in helmets and coveralls at the ITJ gate) replaces bi2774.
- Verification: slides 4, 8–13, 20 (steps 1, 3, 6), 25, 26 captured at 1920x1080; no console errors; PDF exported.
- Next: user review; merge modifikasi-2 when approved.

[progress] 2026-11-10 · Impeccable doctor repairs
- Task: user asked to fix the doctor findings.
- Files: DESIGN.md (rewritten into the eight canonical sections with token frontmatter; North Star "Satu Rit BBM"; v2/v3 content kept), .impeccable/design.json (sidecar: colour ramps, shadows, motion, 8 components, narrative), PRODUCT.md (schema stamp, Platform, Positioning, Operating Context, Evidence on Hand, Product Principles; confirmed by user), .impeccable/config.json (buildPath comp, user choice).
- Verification: impeccable doctor now reports only hook-not-installed.
- Open: `impeccable hooks on` was blocked by the permission classifier (writes .claude/settings.local.json); user to run it.

[progress] 2026-11-10 · Deck v3 (branch modifikasi, worktree Rabuan-modifikasi): GSAP build per click + more visuals
- Task: user asked to improve the deck with impeccable, gsap-core, motion-design, motion-prompt and unslop, with many more visuals; chose build per click and new Codex illustrations.
- Files: src/index.src.html (engine, steps on every slide, A1 and A4 rebuilt, B4 six photos, C1 buffer illustration), scripts/build.sh (Gantt bars and milestones are builds), vendor/gsap.min.js (GSAP 3.15.1 core), assets/illus/{fleet,bmodel,buffer}.jpg (Codex), assets/photos/bi{2233,2294}.jpg, DESIGN.md, SOURCES.md, index.html.
- Changes: 47 click builds over 18 slides; counters, pins, drawn lines, wipes, highlight outline last; cover and dividers open the photo along the slant. A1: fleet illustration with the five Kel 13 figures as labels (photo that repeated divider A removed). A4: value chain strip with the three stage tags, six cards in one row, insight bar. B4: health check and bus safety briefing photos added. C1: buffer-zone illustration replaces a second HSSE briefing photo.
- Verification: all 25 slides captured in final state (#n.9) and mid-build frames for cover, divider B, A1, C2, C3, D2, D3, D4; no console errors; PDF 25 pages via ?print; impeccable detect shows only pre-existing heading-level and dashed-line findings.
- Unslop audit: light slop, polish mode; no copy or facts changed. motion-prompt catalog not used (needs the gallery pick; the motion here is built from the deck's own grammar).
- Next: user review in the browser; merge `modifikasi` into main when approved.

[progress] 2026-11-10 · Git repository initialised for Rabuan/
- Task: put the deck under version control and commit the current state with a change log.
- Files: .gitignore (node_modules/, lib/ unused v1 vendor libs, *.pdf build output), initial commit on branch main (18 MB tracked: src, scripts, docs, assets, fonts, index.html, archive/ v0-v2 without PDFs).
- Verification: git status clean after commit; commit message summarises v2.1 and v2.2.
- Next: user review of v2.2; rebuild the PDF locally with scripts/pdf.mjs (not tracked).

[progress] 2026-11-10 · Deck v2.2: visual pass on all content slides
- Task: user asked for more visuals and images on every slide, SVG or Codex-generated where no photo exists, cohesive with SIG deck and Pertamina design system.
- Files: src/index.src.html (A2, A4, B1, B2, B3, C1, C2, C3, D1, D2, D3 KPI, D4), scripts/build.sh (new `<i data-sym>` -> `<symbol>` for icons inside SVG), assets/illus/{terminal,chain,truck,offline}.jpg (Codex), assets/photos/bi{2094,2120,2353,2364,2392,2659}.jpg (originals resized 2400 px), SOURCES.md, index.html, PDF.
- Changes: B1/A2 isometric illustrations with numbered pins (SIG Narogong pattern); B2 truck cutaway 3 x 8 KL; D2 offline-mode illustration + legend; C3 impact wheel; D1 2015-2026 timeline; B3 icon chain + RAE path diagram + photo strip; C1 hero stats + 3 photos; D4 23-truck pictogram; icons on A4, B2 gates, C2 rows, KPI rows. Text trimmed where visuals carry it.
- Verification: every touched slide captured at 1920x1080 and checked; overflow fixed on C1, B3 (grid rows minmax), B1, D2; check-circles OK; PDF 25 pages, 14 MB.
- Open: Gantt (D3) and Sources unchanged by design; generated images are illustrations, not site photos.
- Next: user review.

[progress] 2026-11-10 · Deck v2.1: polish after side-by-side review against SIG deck
- Task: compare v2 with PPT BI SIG.pdf; fix the biggest gaps without rebuilding.
- Files: src/index.src.html (C1 hero stats per column, C4 photo column), assets/photos/bi2725.jpg (DSCF2725 resized to 2400 px), SOURCES.md, index.html, Business-Immersion-Pertamina.pdf. v2 copied to archive/v2-2026-11-10/.
- Verification: slides 14 and 17 captured at 1920x1080 and checked; check-circles OK; PDF 25 pages.
- Not done: flow diagram for B3, cause tree for C2, map slide (needs real geodata + user OK); body type is already 22px on the 1920 stage, so no type bump.
- Next: user review of v2.1.

[progress] 2026-11-10 · Deck v2 built: SIG-style corporate deck in PPN identity, HTML + PDF
- Task: new BI presentation from Kel 9/11/12/13 material; SIG deck as style reference; /impeccable + /unslop.
- Files: src/index.src.html (single file, inline CSS/JS), scripts/build.sh (icons + Gantt rows), index.html, Business-Immersion-Pertamina.pdf (25 pages), DESIGN.md rewritten, PRODUCT.md, SOURCES.md. v1 css/js/src removed (identical copies in archive/v1-2026-11-10).
- Fix: C4 number circles were hit by `.cap5 .r .name span`; selector narrowed; scripts/check-circles.mjs added (all .n round).
- Verification: all 25 slides captured at 1920×1080 and checked; PDF 25 pages; impeccable detect: heading-level skips (slide structure) and one Gantt padding false positive left.
- Open: section B is a draft until Kel 9 uploads; Kel 13 number conflicts shown side by side; PIC of section D listed as Calvin (from Kel 12 slides).
- Next: user review.

[progress] 2026-11-10 · Deck v1 archived (user: "Hasilnya jelek")
- Task: archive latest deck after rejection.
- Files: archive/v1-2026-11-10/ (index.html, css, js, src, scripts, DESIGN/PRODUCT/SOURCES.md, NOTE.md). Working tree untouched.
- Verification: 24 files copied, 892K.
- Next: get concrete feedback on what failed before any v2 rebuild.

[progress] 2026-11-10 · Rabuan ALP deck rebuilt from scratch (HTML, Three.js, GSAP)
- Task: deck with animation, 3D and the Pertamina design system; opening question about tank-truck compartments with the answer on the next slide; real references only.
- Files: index.html (built from src/index.src.html), css/{tokens,deck,slides}.css, js/{deck,motion,slides}.js, src/{common,truck,scene-truck,scene-terminal,scene-logo,scenes}.js, scripts/{build.sh,shot.mjs,probe.mjs,fitcam.mjs,pdf.mjs}, PRODUCT.md, DESIGN.md, SOURCES.md. Old deck in archive/v0-2026-11-10/.
- Verification: build OK; all 23 slides captured at 1920×1080 (final states and seek frames), 1366×768 spot check, 23-page PDF export with 3D snapshots; impeccable detect left 6 table-row padding warnings on the Gantt; contrast checked (small text ≥4.5:1).
- Open: section B waits for Kel 9; number conflicts listed in SOURCES.md; Kel 13 has no stakeholder content for A4.
- Next: fill section B when Kel 9 uploads; group sign-off on the conflicting numbers.
