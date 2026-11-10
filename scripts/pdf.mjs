// Export every slide (final step state) to PDF: node scripts/pdf.mjs out.pdf
import puppeteer from "puppeteer-core";
import path from "node:path";
const out = process.argv[2] || "Rabuan-ALP.pdf";
const b = await puppeteer.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"], defaultViewport: { width: 1920, height: 1080 } });
const p = await b.newPage();
p.on("pageerror", e => console.log("pageerror", String(e)));
await p.goto("file://" + path.resolve("index.html") + "?print", { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 6000));
await p.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, pageRanges: "" });
console.log("wrote", out);
await b.close();
