// Makes a 1200x630 share image for each story (the preview shown on WhatsApp, X, etc.).
// Usage: npm install && node tools/cards.js          (only stories without a card)
//        node tools/cards.js --all                    (redo every card)
//        node tools/cards.js <story-id> [<story-id>…] (specific stories)
// Needs Playwright (require('playwright')) and the @fontsource packages from package.json.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const ART = path.join(ROOT, "content/articles");
const OUT = path.join(ROOT, "content/cards");
const FONTS = path.join(ROOT, "node_modules/@fontsource");
const TZ = "Asia/Kolkata";
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const font = (fam, file) => "file://" + path.join(FONTS, fam, "files", file);
const logo = "data:image/png;base64," + fs.readFileSync(path.join(ROOT, "assets/logo.png")).toString("base64");

function html(s, id) {
  const d = new Date(s.publishedAt);
  const date = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" }).format(d);
  const live = s.breaking && Date.now() - d < 36 * 3600e3;
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:PF;font-weight:800;src:url(${font("playfair-display", "playfair-display-latin-800-normal.woff2")})}
@font-face{font-family:PM;font-weight:500;src:url(${font("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2")})}
@font-face{font-family:PM;font-weight:600;src:url(${font("ibm-plex-mono", "ibm-plex-mono-latin-600-normal.woff2")})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#F2EDE3;color:#1A1714;overflow:hidden;position:relative}
.top{position:absolute;left:72px;right:72px;top:52px;display:flex;justify-content:space-between;align-items:center}
.logo{height:84px;width:180px;background:#1A1714;-webkit-mask:url(${logo}) left center/contain no-repeat}
.k{font:600 21px PM;letter-spacing:.14em;text-transform:uppercase;color:#B3182B}
.k.live{background:#B3182B;color:#fff;padding:9px 14px}
.box{position:absolute;left:72px;right:72px;top:172px;bottom:118px;display:flex;align-items:center;border-left:6px solid #B3182B;padding-left:34px}
h1{font:800 66px/1.1 PF;letter-spacing:-.01em}
.foot{position:absolute;left:72px;right:72px;bottom:52px;display:flex;justify-content:space-between;font:500 20px PM;color:#4B463F;border-top:2px solid #1A1714;padding-top:18px}
</style>
<div class="top"><div class="logo"></div><div class="k${live ? " live" : ""}">${live ? "Breaking · " : ""}${esc(s.section)}</div></div>
<div class="box"><h1 id="h">${esc(s.title)}</h1></div>
<div class="foot"><span>${esc((site.domain || "").replace(/^https?:\/\//, "") || site.name)}</span><span>${esc(date)}</span></div>`;
}

(async () => {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const only = args.filter((a) => !a.startsWith("--"));
  fs.mkdirSync(OUT, { recursive: true });
  const ids = fs.readdirSync(ART).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5))
    .filter((id) => (only.length ? only.includes(id) : all || !fs.existsSync(path.join(OUT, id + ".jpg"))));
  if (!ids.length) return console.log("All stories already have share images.");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const id of ids) {
    const s = JSON.parse(fs.readFileSync(path.join(ART, id + ".json"), "utf8"));
    if (s.status === "draft") continue;
    const tmp = path.join(OUT, ".card.html");
    fs.writeFileSync(tmp, html(s, id));
    await page.goto("file://" + tmp);
    await page.evaluate(() => document.fonts.ready);
    // Shrink the headline until it fits its box
    await page.evaluate(() => {
      const h = document.getElementById("h"), box = h.parentElement;
      let size = 66;
      while ((h.scrollHeight > box.clientHeight || h.scrollWidth > box.clientWidth) && size > 36) { size -= 2; h.style.fontSize = size + "px"; }
    });
    await page.screenshot({ path: path.join(OUT, id + ".jpg"), type: "jpeg", quality: 86 });
    fs.unlinkSync(tmp);
    console.log("card:", id);
  }
  await browser.close();
})();
