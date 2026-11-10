// Usage: node scripts/probe.mjs <hash> <seconds> "<js expression>"  → prints the expression's value
import puppeteer from "puppeteer-core";
import path from "node:path";
const [hash, secs, expr] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"], defaultViewport: { width: 1920, height: 1080 } });
const p = await b.newPage();
p.on("pageerror", e => console.log("pageerror", String(e)));
await p.goto("file://" + path.resolve("index.html") + "?shot#" + hash, { waitUntil: "load" });
await new Promise(r => setTimeout(r, +secs * 1000));
console.log(await p.evaluate(`JSON.stringify((() => (${expr}))())`));
await b.close();
