const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";
const ARTIFACT_DIR =
  process.env.E2E_ARTIFACT_DIR ||
  path.join(process.cwd(), "test-results", "detective-playwright");
const TEST_EMAIL = process.env.E2E_EMAIL || "detective-e2e@example.com";
const PASSWORD = process.env.E2E_PASSWORD || "Detective-12345";

const VIEWPORTS = [
  { name: "mobile", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 860 },
];

const report = {
  baseUrl: BASE_URL,
  startedAt: new Date().toISOString(),
  steps: [],
  screenshots: [],
  consoleErrors: [],
  responseFailures: [],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function step(name, fn) {
  const startedAt = Date.now();
  try {
    const result = await fn();
    report.steps.push({ name, status: "passed", durationMs: Date.now() - startedAt });
    return result;
  } catch (error) {
    report.steps.push({ name, status: "failed", durationMs: Date.now() - startedAt, error: error.message });
    throw error;
  }
}

async function screenshot(page, name) {
  const file = path.join(ARTIFACT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  report.screenshots.push(file);
}

async function createTrackedPage(context) {
  const page = await context.newPage();
  page.on("console", (message) => {
    const text = message.text();
    const isNoise =
      text.includes("WebSocket connection to") ||
      text.includes("/_next/webpack-hmr") ||
      text.includes("Encountered a script tag") ||
      text.includes("AudioContext was not allowed") ||
      text.includes("Login error Error:") ||
      text.includes("status of 401");
    if (message.type() === "error" && !isNoise) {
      report.consoleErrors.push({ text, url: page.url() });
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      report.responseFailures.push({ url: response.url(), status: response.status() });
    }
  });
  return page;
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0);
    return Math.max(0, width - window.innerWidth);
  });
  assert(overflow <= 2, `${label}: horizontal overflow ${overflow}px`);
}

async function routeSmoke(browser) {
  const context = await browser.newContext();
  const page = await createTrackedPage(context);
  await page.goto(`${BASE_URL}/cases`, { waitUntil: "networkidle" });
  const caseHref = await page.locator('a[href^="/cases/"]:not([href^="/cases/category/"])').first().getAttribute("href");
  const categoryHref = await page.locator('a[href^="/cases/category/"]').first().getAttribute("href");
  assert(caseHref && categoryHref, "case and category links should exist on /cases");
  await context.close();

  const routes = [
    { name: "home", path: "/" },
    { name: "cases", path: "/cases" },
    { name: "case", path: caseHref },
    { name: "category", path: categoryHref },
    { name: "play", path: "/play" },
  ];

  for (const viewport of VIEWPORTS) {
    const viewportContext = await browser.newContext({ viewport });
    const viewportPage = await createTrackedPage(viewportContext);
    for (const route of routes) {
      await viewportPage.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle" });
      await viewportPage.locator(".dossier, input[name='email']").first().waitFor({ state: "visible", timeout: 20000 });
      await assertNoHorizontalOverflow(viewportPage, `${route.name}@${viewport.name}`);
      await screenshot(viewportPage, `route-${route.name}-${viewport.name}`);
    }
    await viewportContext.close();
  }
}

async function authenticate(page) {
  await page.goto(`${BASE_URL}/play`, { waitUntil: "networkidle" });
  const lobby = page.locator(".career-bar");
  if (await lobby.isVisible().catch(() => false)) return;

  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Giriş Yap" }).last().click();

  const loggedIn = await lobby.waitFor({ state: "visible", timeout: 8000 }).then(() => true).catch(() => false);
  if (loggedIn) return;

  // First run against a fresh local backend: register the fixture account, then log in.
  await page.getByRole("button", { name: /Kayıt Ol/ }).last().click();
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('input[name="passwordConfirm"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Kayıt Ol" }).last().click();
  await page.getByRole("heading", { name: "Giriş Yap" }).waitFor({ state: "visible", timeout: 15000 });
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Giriş Yap" }).last().click();
  await lobby.waitFor({ state: "visible", timeout: 15000 });
}

async function playFullCase(page) {
  await page.locator(".case-tile:not(.is-locked)").first().waitFor({ state: "visible", timeout: 20000 });
  await assertNoHorizontalOverflow(page, "lobby");
  await screenshot(page, "game-lobby");

  await page.locator(".case-tile:not(.is-locked)").first().click();
  await page.locator(".briefing-story .paper").waitFor({ state: "visible", timeout: 15000 });
  await screenshot(page, "game-briefing");

  // A case with an open run offers resume or restart; restart keeps the test deterministic.
  const restart = page.getByRole("button", { name: "Baştan başla" });
  if (await restart.isVisible().catch(() => false)) {
    await restart.click();
    await page.getByRole("button", { name: "Evet, baştan başla" }).click();
  } else {
    await page.getByRole("button", { name: /Soruşturmayı başlat/ }).click();
  }

  const tour = page.getByRole("dialog", { name: "Nasıl oynanır" });
  if (await tour.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false)) {
    await screenshot(page, "game-tour");
    await tour.getByRole("button", { name: "Geç" }).click();
  }

  await page.locator(".casefile-card").click();
  await page.locator(".paper-story").waitFor({ state: "visible" });
  await screenshot(page, "game-casefile");
  await page.getByRole("button", { name: "Pano" }).click();

  await page.locator(".evidence-card.has-photo").first().click();
  await page.locator(".paper .evidence-photo").waitFor({ state: "visible" });
  await page.getByRole("button", { name: /iğnele/ }).click();
  await screenshot(page, "game-evidence");
  await page.getByRole("button", { name: "Pano" }).click();

  await page.locator(".lineup-board .lineup-btn").first().click();
  const promptChip = page.locator(".prompt-chip").first();
  if (await promptChip.isVisible().catch(() => false)) {
    await promptChip.click();
  } else {
    await page.locator(".ask-bar input").fill("Olay sırasında neredeydin?");
    await page.locator(".ask-bar button[type='submit']").click();
  }
  await page.locator(".bubble.them:not(.typing)").first().waitFor({ state: "visible", timeout: 60000 });
  await page.getByRole("radio", { name: "Şüpheli", exact: true }).click();
  await page.locator(".present-btn").click();
  await page.locator(".evidence-picker").waitFor({ state: "visible" });
  await screenshot(page, "game-interrogation");
  await page.locator(".present-btn").click();
  await page.getByRole("button", { name: "Pano" }).click();

  await page.getByRole("button", { name: "İpucu al" }).click();
  await page.getByRole("button", { name: "Al", exact: true }).click();
  await page.locator(".hint-card").first().waitFor({ state: "visible", timeout: 15000 });
  await assertNoHorizontalOverflow(page, "hints");
  await assertNoHorizontalOverflow(page, "investigation");

  await page.locator(".accuse-btn").click();
  await page.locator(".lineup-accuse .lineup-btn").first().click();
  await page.locator("#accusation-reason").fill("Zaman çizelgesi ve giriş kaydı bu kişiyi işaret ediyor.");
  await screenshot(page, "game-accusation");
  await page.getByRole("button", { name: "Suçla" }).click();

  await page.locator(".verdict-stamp").waitFor({ state: "visible", timeout: 60000 });
  await page.waitForTimeout(1200);
  await assertNoHorizontalOverflow(page, "result");
  await screenshot(page, "game-result");
  report.verdict = await page.locator(".verdict").innerText();
}

(async () => {
  await fs.rm(ARTIFACT_DIR, { recursive: true, force: true });
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    await step("responsive route smoke", () => routeSmoke(browser));

    for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
      await step(`full gameplay @${viewport.name}`, async () => {
        const context = await browser.newContext({ viewport });
        const page = await createTrackedPage(context);
        await authenticate(page);
        await playFullCase(page);
        await context.close();
      });
    }

    assert(report.consoleErrors.length === 0, `Console errors: ${JSON.stringify(report.consoleErrors)}`);
    assert(report.responseFailures.length === 0, `5xx responses: ${JSON.stringify(report.responseFailures)}`);
    report.status = "passed";
  } catch (error) {
    report.status = "failed";
    report.error = error.message;
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    await browser.close();
    await fs.writeFile(path.join(ARTIFACT_DIR, "report.json"), JSON.stringify(report, null, 2));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
