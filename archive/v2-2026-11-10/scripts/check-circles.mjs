import puppeteer from "puppeteer-core"; import path from "node:path";
const b = await puppeteer.launch({ executablePath: "/usr/bin/chromium", headless: true, defaultViewport: { width: 1920, height: 1080 } });
const p = await b.newPage();
await p.goto("file://" + path.resolve("index.html") + "?print", { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
const bad = await p.evaluate(() => [...document.querySelectorAll(".n")].map(e => {
  const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  const slide = [...document.querySelectorAll(".slide")].indexOf(e.closest(".slide")) + 1;
  const ok = (cs.display === "inline-grid" || cs.display === "grid") && Math.abs(r.width - r.height) < 1 && cs.opacity === "1";
  return ok ? null : `slide ${slide}: "${e.textContent}" display=${cs.display} ${r.width.toFixed(0)}x${r.height.toFixed(0)} opacity=${cs.opacity}`;
}).filter(Boolean));
console.log(bad.length ? bad.join("\n") : "all number circles OK");
await b.close();
