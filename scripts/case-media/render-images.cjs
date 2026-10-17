// Renders evidence images from images.cjs into public/case-media. Usage: node scripts/case-media/render-images.cjs [filter]
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const templates = require("./templates.cjs");
const images = require("./images.cjs");

const OUT_DIR = path.join(__dirname, "..", "..", "public", "case-media");

(async () => {
  const filter = process.argv[2] || "";
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1.5 });
  let rendered = 0;

  for (const [file, spec] of Object.entries(images)) {
    if (filter && !file.includes(filter)) continue;
    const { width, height, html } = templates[spec.template](spec.data);
    await page.setViewportSize({ width, height: height || 100 });
    await page.setContent(html, { waitUntil: "load" });
    const target = path.join(OUT_DIR, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, fullPage: !height, type: "jpeg", quality: 82 });
    rendered += 1;
    console.log(`rendered ${file}`);
  }

  await browser.close();
  console.log(`${rendered} images rendered`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
