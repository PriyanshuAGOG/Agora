// Render brand.html's #asset-* elements to transparent PNGs in ../ (the brand sticker library) (trimmed to their ink).
//   node .claude/skills/typography-reels/engine/stickers/brand/src/render.mjs [name ...]
// These are recreations of the creator's DIY logo + stickers. Dropping the original PNGs into
// engine/stickers/brand/ under the same names (diy-logo.png, yar-mode-on.png, ...) replaces them in the edit.
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

// playwright from the project or the global npm root
const req = createRequire(import.meta.url);
let pw;
try { pw = req("playwright"); } catch { pw = req(path.join(execSync("npm root -g").toString().trim(), "playwright")); }
const { chromium } = pw;

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, "..");
fs.mkdirSync(out, { recursive: true });
const only = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
await page.goto("file://" + path.join(here, "brand.html"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
for (const el of await page.$$("[id^=asset-]")) {
  const name = (await el.getAttribute("id")).slice(6);
  if (only.length && !only.includes(name)) continue;
  // sparks hang outside the element box: grab a margin around it, then trim to the visible pixels
  const b = await el.boundingBox();
  const M = 150;
  await page.screenshot({ path: path.join(out, `${name}.png`), omitBackground: true, fullPage: true, clip: { x: b.x - M, y: b.y - M, width: b.width + 2 * M, height: b.height + 2 * M } });
  console.log("wrote", `${name}.png`);
}
await browser.close();
// crop each PNG to its visible pixels (+8 px)
execSync(`python3 -c "
import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f); b = im.getchannel('A').getbbox()
    im.crop((max(b[0]-8, 0), max(b[1]-8, 0), min(b[2]+8, im.width), min(b[3]+8, im.height))).save(f)
" ${fs.readdirSync(out).filter((f) => f.endsWith(".png") && (!only.length || only.includes(f.slice(0, -4)))).map((f) => JSON.stringify(path.join(out, f))).join(" ")}`);
