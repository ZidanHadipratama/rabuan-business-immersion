#!/usr/bin/env bash
# Build index.html from src/index.src.html:
#   <i data-ic="name"></i>  -> inline Tabler outline icon
#   <!--ROWS-->             -> Gantt rows for slide D3 (data below, read from Kel 12's slide)
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import re, pathlib, html
src = pathlib.Path("src/index.src.html").read_text()
icons = pathlib.Path("node_modules/@tabler/icons/icons/outline")

def icon(m):
    svg = (icons / f"{m.group(1)}.svg").read_text()
    svg = re.sub(r'\s+', ' ', svg).strip()
    svg = re.sub(r'<path stroke="none" d="M0 0h24v24H0z" fill="none" ?/>', '', svg)
    svg = re.sub(r' (width|height)="24"', '', svg)
    svg = re.sub(r'class="[^"]*"', 'class="ic" aria-hidden="true"', svg)
    return svg

# (task, PIC, start col, end col) on M7..M16 = 0..9, Pasca-ALP = 10
rows = [
    ("1 Validasi masalah & baseline data", "Tim ALP (data) · Spv. Operasi", 0, 2),
    ("2 Desain SOP, form offline & aturan rekonsiliasi", "Tim ALP (desain) · Fungsi IT", 2, 4),
    ("3 Pilot Modul A di 2–4 filling point + drill gangguan", "Terminal Manager · Spv. shift", 4, 7),
    ("4 Ukur dampak & business case scale-up", "Tim ALP · mentor & coach", 6, 9),
    ("5 Final report & presentasi", "Tim ALP", 9, 10),
    ("6 Scale-up Modul A ke 34 filling point; Modul B & C", "Fungsi Distribusi & IT PPN", 10, 11),
]
out = []
for r, (task, pic, s, e) in enumerate(rows, start=2):
    out.append(f'<div class="c t" style="grid-row:{r};grid-column:1">{html.escape(task)}</div>')
    out.append(f'<div class="c" style="grid-row:{r};grid-column:2">{html.escape(pic)}</div>')
    for j in range(11):
        out.append(f'<div class="c" style="grid-row:{r};grid-column:{3+j}"></div>')
    post = e == 11
    label = '<em>6–12 bln</em>' if post else ''
    out.append(f'<div class="bar{" post" if post else ""}" style="grid-row:{r};grid-column:{3+s}/{3+e};border:0">{label}<i></i></div>')
ms = 2 + len(rows)
out.append(f'<div class="ms" style="grid-row:{ms};grid-column:1/3;justify-content:flex-start;padding-left:18px;font-family:inherit;font-weight:600;color:var(--ink-3)">Milestone ALP</div>')
out.append(f'<div class="ms" style="grid-row:{ms};grid-column:8"><b>MS2</b></div>')
out.append(f'<div class="ms" style="grid-row:{ms};grid-column:12"><b>MS3</b></div>')

page = re.sub(r'<i data-ic="([a-z0-9-]+)"></i>', icon, src)
page = page.replace("<!--ROWS-->", "\n      ".join(out))
pathlib.Path("index.html").write_text(page)
PY
echo "built index.html ($(du -h index.html | cut -f1))"
