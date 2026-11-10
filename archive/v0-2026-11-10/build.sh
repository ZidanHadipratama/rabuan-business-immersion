#!/usr/bin/env bash
# Bundle the Three.js scenes and inline the official logo SVG into index.html.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import re, pathlib
p = pathlib.Path("index.html"); h = p.read_text()
svg = pathlib.Path("assets/brand/ppn-color.svg").read_text().strip()
h2 = re.sub(r'(<template id="ppn-svg">).*?(</template>)', lambda m: m.group(1) + svg + m.group(2), h, flags=re.S)
if h2 != h: p.write_text(h2)
PY
npx esbuild src/scenes.js --bundle --format=iife --minify --target=es2020 \
  --alias:three=./lib/three/three.module.js --outfile=js/scenes.bundle.js --log-level=warning
echo "built js/scenes.bundle.js ($(du -h js/scenes.bundle.js | cut -f1))"
