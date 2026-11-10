# Sources

## Opening question (slides 2–3)
- Otomotifnet/GridOto, 7 Jan 2023, "Canggih, Truk Tangki Pertamina Bisa Angkut Banyak Jenis BBM, Ini Caranya". Heppy Wulansari (Pjs VP Corporate Communication Pertamina): "Setiap kompartemen memiliki kapasitas 8.000 liter"; MT 16, 18, 24, 32 KL have compartments that can hold several fuel types; MT 8 KL carries one type; "satu mobil tangki bisa membawa beberapa jenis BBM karena didesain dengan kompartemen di dalamnya". https://otomotifnet.gridoto.com/read/233645341/canggih-truk-tangki-pertamina-bisa-angkut-banyak-jenis-bbm-ini-caranya
- Liputan6, 19 Dec 2017, "Jaga Pasokan BBM, Pertamina Siagakan SPBU Kantong": 32 KL, four compartments, 8 KL each. https://www.liputan6.com/bisnis/read/3201327/jaga-pasokan-bbm-pertamina-siagakan-spbu-kantong
- GridOto, 7 Jul 2021: fuel dye colours (Pertalite green, Pertamax blue, Pertamax Turbo red), Tri Yuswidjadjanto, ITB. https://otomotifnet.gridoto.com/read/232776766/tiap-varian-bbm-pertamina-warnanya-beda-beda-konsumen-harus-ngerti-ini-alasannya
- Participant reports summary (`Video/drive-peserta-kelompok-9-11-12-13/RANGKUMAN-KEGIATAN-PERTAMINA.md`): 8 KL compartments; orders must match vehicle capacity, not only terminal stock.

## Design system
- Logo files: `assets/brand/ppn-color.svg`, `ppn-white.svg` (official PPN SVG); colours read from the SVG.
- Logo colour meanings (pertamina.com, quoted by CNN Indonesia 2 Feb 2023 and GridOto): https://www.cnnindonesia.com/otomotif/20230202111001-579-908020/arti-warna-merah-biru-hijau-di-spbu-pertamina
- Typeface: Rethink Sans, loaded by https://pertaminapatraniaga.com/ (checked 10 Nov 2026); Plus Jakarta Sans on https://www.pertamina.com/.
- Neutrals `#0F172A #F1F5F9 #F8FAFC #05416D #0762A3`: pertaminapatraniaga.com stylesheet.
- Icons: Tabler Icons (loaded by pertamina.com), MIT, npm `@tabler/icons` 3.x.
- Motion: Motion Prompt by Shohei Ohtaki (MIT), elements #002 #004 #005 #007 #028 #044 #126 #164.

## Group material (ALP Google Drive, folder 1BqLQevK1oXUTWLYx3ts7y6jWzz_vNbf9)
- Kel 13 (Rabuan folder): Kelompok 13.1 Proses Bisnis PPN, 13.2 Business Unit Overview ITJ, 13.3 Business Model, 13.4 Pusat Kendali Operasi IT Plumpang (image).
- Kel 11: `Kel 11/ALP-00_Kelompok_11_Deck_Pemetaan_Business_Immersion.pptx`, slides C1–C4.
- Kel 12 (Rabuan folder): "Kelompok 12", D1–D4 (Gantt bars read from the rendered slide).
- Kel 9: no deck as of 10 Nov 2026. Section B drafted from the nine Kel 9 individual BI reports (S01–S09) in `../Video/drive-peserta-kelompok-9-11-12-13/Kelompok 9/`, summarised in `RANGKUMAN-KEGIATAN-PERTAMINA.md` (S-codes used on slides), plus S10–S39 where cited.

## Images (provenance)
| File | Source |
|---|---|
| `assets/photos/bi1970, 2081, 2189, 2319, 2347, 2387, 2388, 2401, 2433, 2505, 2539, 2611, 2614, 2633, 2637, 2725, 2774, 2094, 2120, 2353, 2364, 2392, 2659.jpg` | Participants' Business Immersion photos, ITJ Plumpang, 7 Oct 2026 (Fujifilm, originals DSCFxxxx in `Video/research_notes/business-immersion/originals`), resized to 2400 px |
| `assets/illus/terminal.jpg, chain.jpg, truck.jpg, offline.jpg` | AI-generated illustrations (Codex CLI image generation, 10 Nov 2026), no text or logos; labelled on-slide as ilustrasi, bukan skala. Used on A2, B1, B2, D2. Not a depiction of the real ITJ layout |
| Wheel (C3), timeline (D1), RAE paths (B3), truck pictogram (D4) | Inline SVG drawn in `src/index.src.html`; icons from Tabler (MIT) |

## Open number conflicts (shown with their own sources, not harmonised)
- Daily throughput: 16.504 kL/day (Kel 13, 13.4) vs 17.000–19.000 KL/day (Kel 11, management briefing).
- Distribution channels: >1.000 lembaga penyalur & kanal (Kel 13) vs >120 lembaga penyalur (Kel 11, Kel 12).
- Loading points: 12 TAS lines (Kel 13) vs 34 filling points (Kel 11, Bisnis.com).
- Kel 12's D slides name "Kel 11" as project PIC (the plan builds on Kel 11's analysis).

## v2 additions (10 Nov 2026)
- Style reference: `../PPT BI SIG.pdf` (PT Semen Indonesia Business Immersion, Drive P3MD SBM ITB, uploaded 9 Nov 2026).
- A2 regulators/shareholder: Kel 12 ALP-00 deck (6 Nov 2026). "SPBU under Retail, not Supply & Distribution": Kel 9 ALP Coaching 1 (interview).
- D3: Kel 12 names "Kel 11" as executor; the deck writes "Tim ALP" and says so in the slide footer.
