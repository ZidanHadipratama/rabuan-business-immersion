// Usage: node scripts/shot.mjs <outdir> <spec>...   spec = slide[:steps][@seconds]  e.g. 2@5 2:1@6
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
const [outdir, ...specs] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const url = "file://" + path.resolve("index.html") + "?shot";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium", headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--window-size=1920,1080"],
  defaultViewport: { width: 1920, height: 1080 },
});
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e)));
page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errs.push(m.type() + ": " + m.text()); });
for (const spec of specs) {
  const m = spec.match(/^(\d+)(?::(\d+))?(?:@([\d.]+))?$/);
  const [n, steps, secs] = [m[1], +(m[2] || 0), +(m[3] || 3)];
  await page.goto("about:blank"); await page.goto(url + "#" + n, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 400));
  for (let i = 0; i < steps; i++) { await page.keyboard.press("ArrowRight"); }
  await new Promise(r => setTimeout(r, secs * 1000));
  const f = path.join(outdir, `s${n}${steps ? "-st" + steps : ""}@${secs}.png`);
  await page.screenshot({ path: f });
  console.log(f);
}
if (errs.length) console.log("ERRORS:\n" + [...new Set(errs)].join("\n"));
await browser.close();
