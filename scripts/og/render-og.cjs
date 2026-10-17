// Renders the default social share image (public/og.jpg, 1200x630). Usage: node scripts/og/render-og.cjs
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const icon = fs.readFileSync(path.join(__dirname, "..", "..", "src", "app", "icon.svg"), "utf8");
const folder = (title, tag, color, rotate, x, y) => `
  <div class="folder" style="left:${x}px;top:${y}px;transform:rotate(${rotate}deg)">
    <span class="tab">${tag}</span><div class="body"><b>${title}</b><span class="diff" style="background:${color}">${
  color === "#a3261d" ? "ZOR" : "ORTA"
}</span><i>GİZLİ</i></div></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:radial-gradient(ellipse at 75% 40%,#2a241a 0%,#0f0f0e 60%);font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;color:#ede6d6;position:relative}
.rain{position:absolute;inset:0;background:repeating-linear-gradient(105deg,transparent 0 22px,rgba(255,255,255,.035) 22px 23px);}
.brand{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:18px}
.brand svg{width:72px;height:72px}
.word b{display:block;font:700 30px Menlo,monospace;letter-spacing:.22em}
.word span{display:block;margin-top:6px;font:500 15px Menlo,monospace;letter-spacing:.5em;color:#D4A24C}
h1{position:absolute;left:72px;top:200px;width:560px;font-size:58px;line-height:1.05;font-weight:700;letter-spacing:-.02em}
h1 em{font-style:normal;color:#D4A24C}
p{position:absolute;left:72px;top:400px;width:520px;font-size:24px;line-height:1.4;color:#b9b1a2}
.cta{position:absolute;left:72px;top:520px;display:inline-block;padding:14px 26px;border-radius:10px;background:#D4A24C;color:#15120c;font-weight:700;font-size:22px}
.folder{position:absolute;width:360px;height:250px;padding-top:24px}
.tab{position:absolute;top:0;left:24px;padding:4px 14px;border-radius:8px 8px 0 0;background:#8F7845;color:#2a2110;font:13px Menlo,monospace;letter-spacing:.1em}
.body{position:relative;height:100%;border-radius:4px 14px 14px 14px;background:repeating-linear-gradient(0deg,transparent 0 30px,rgba(58,46,21,.08) 30px 31px),#c9ad70;box-shadow:0 24px 50px rgba(0,0,0,.6);padding:24px;display:flex;flex-direction:column;justify-content:flex-end;color:#2a2110}
.body b{font:700 26px Menlo,monospace;line-height:1.15}
.diff{align-self:flex-start;margin-top:10px;padding:3px 10px;border-radius:5px;color:#fff;font:700 13px Menlo,monospace;letter-spacing:.1em}
.body i{position:absolute;top:22px;right:20px;font:700 16px Menlo,monospace;letter-spacing:.15em;color:#9a2f25;border:3px solid #9a2f25;border-radius:6px;padding:3px 10px;transform:rotate(-8deg);font-style:normal;opacity:.85}
</style></head><body><div class="rain"></div>
<div class="brand">${icon}<div class="word"><b>DETECTIVE</b><span>SIMULATOR</span></div></div>
<h1>Şüpheliyi <em>sen</em> sorgula, katili <em>sen</em> bul.</h1>
<p>Yapay zekâlı, Türkçe ve ücretsiz online dedektif oyunu.</p>
<span class="cta">detectivesimulator.com</span>
${folder("Pera Galeri Gecesi", "No. 3816", "#a3261d", -6, 700, 70)}
${folder("Galata Patent Dosyası", "No. 7114", "#c45a12", 5, 760, 300)}
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: path.join(__dirname, "..", "..", "public", "og.jpg"), type: "jpeg", quality: 88 });
  await browser.close();
  console.log("public/og.jpg rendered");
})();
