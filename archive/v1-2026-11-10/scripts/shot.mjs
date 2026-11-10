// Usage: node scripts/shot.mjs <outdir> <spec>...   spec = slide[.step][@seconds]
//   "3@9"  → open slide 3, play its entrance, capture after 9 s
//   "3.1"  → open slide 3 at step 1 in its final state, capture after 2 s
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
const [outdir, ...specs] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const W = +(process.env.W || 1920), H = +(process.env.H || 1080);
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium", headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", `--window-size=${W},${H}`],
  defaultViewport: { width: W, height: H },
});
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e)));
page.on("console", m => { if (["error", "warn", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
for (const spec of specs) {
  const m = spec.match(/^(\d+)(?:\.(\d+))?(?:[@~]([\d.]+))?$/);
  const seek = spec.includes("~");
  const [n, st, secs] = [m[1], m[2], seek ? 2.5 : +(m[3] || (m[2] ? 2.5 : 4))];
  await page.goto("about:blank");
  await page.goto("file://" + path.resolve("index.html") + (seek ? "?shot&seek=" + m[3] : "?shot") + "#" + n + (st ? "." + st : ""), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, secs * 1000));
  const f = path.join(outdir, `s${String(n).padStart(2, "0")}${st ? "-" + st : ""}${m[3] ? (seek ? "~" + m[3] : "@" + secs) : ""}.png`);
  await page.screenshot({ path: f });
  console.log(f);
}
if (errs.length) console.log("ERRORS:\n" + [...new Set(errs)].join("\n"));
await browser.close();
