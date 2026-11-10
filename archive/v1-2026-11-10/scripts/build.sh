#!/usr/bin/env bash
# 1) Bundle the Three.js scenes (IIFE so the deck runs from file://).
# 2) Build index.html from src/index.src.html, inlining Tabler icons (<i data-ic="name"></i>).
set -euo pipefail
cd "$(dirname "$0")/.."
npx esbuild src/scenes.js --bundle --format=iife --minify --target=es2020 \
  --alias:three=./lib/three/three.module.js --loader:.svg=text \
  --outfile=js/scenes.bundle.js --log-level=warning
python3 - <<'PY'
import re, pathlib
src = pathlib.Path("src/index.src.html").read_text()
icons = pathlib.Path("node_modules/@tabler/icons/icons/outline")
def icon(m):
    svg = (icons / f"{m.group(1)}.svg").read_text()
    svg = re.sub(r'\s+', ' ', svg).strip()
    svg = re.sub(r'<path stroke="none" d="M0 0h24v24H0z" fill="none" ?/>', '', svg)
    svg = re.sub(r' (width|height)="24"', '', svg)
    svg = re.sub(r'class="[^"]*"', 'class="ic" aria-hidden="true"', svg)
    return svg
out = re.sub(r'<i data-ic="([a-z0-9-]+)"></i>', icon, src)
pathlib.Path("index.html").write_text(out)
PY
echo "built index.html + js/scenes.bundle.js ($(du -h js/scenes.bundle.js | cut -f1))"
