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
  { name: "small-mobile", width: 360, height: 800 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "compact-desktop", width: 1024, height: 768 },
  { name: "desktop", width: 1366, height: 900 },
];

const report = {
  baseUrl: BASE_URL,
  startedAt: new Date().toISOString(),
  viewports: VIEWPORTS,
  steps: [],
  visualChecks: [],
  screenshots: [],
  consoleErrors: [],
  responseFailures: [],
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function step(name, fn) {
  const startedAt = Date.now();
  try {
    const result = await fn();
    report.steps.push({ name, status: "passed", durationMs: Date.now() - startedAt });
    return result;
  } catch (error) {
    report.steps.push({
      name,
      status: "failed",
      durationMs: Date.now() - startedAt,
      error: error.message,
    });
    throw error;
  }
}

async function screenshot(page, name) {
  const file = path.join(ARTIFACT_DIR, `${slugify(name)}.png`);
  await page.screenshot({ path: file, fullPage: true });
  report.screenshots.push(file);
  return file;
}

async function createTrackedPage(context) {
  const page = await context.newPage();
  page.on("console", (message) => {
    const text = message.text();
    const isDevHmrNoise =
      text.includes("/_next/webpack-hmr") ||
      text.includes("WebSocket connection to") ||
      text.includes("net::ERR_INVALID_HTTP_RESPONSE") ||
      text.includes("Login error Error:") ||
      text.includes("server responded with a status of 401");
    if (message.type() === "error" && !isDevHmrNoise) {
      report.consoleErrors.push({
        text,
        location: message.location(),
      });
    }
  });
  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();
    if (status >= 500) {
      report.responseFailures.push({ url, status });
    }
  });
  return page;
}

async function waitForVisible(locator, label, timeout = 15000) {
  await locator.waitFor({ state: "visible", timeout }).catch((error) => {
    throw new Error(`${label} did not become visible: ${error.message}`);
  });
}

async function waitForPlayReady(page) {
  const scenarioHeading = page.getByRole("heading", { name: "Senaryolar" });
  const loginHeading = page.getByRole("heading", { name: "Giriş Yap" });
  const registerHeading = page.getByRole("heading", { name: "Kayıt Ol" });
  const landingHeading = page.getByText(/Vakanı seç, delilleri topla/i);
  await Promise.race([
    scenarioHeading.waitFor({ state: "visible", timeout: 20000 }),
    loginHeading.waitFor({ state: "visible", timeout: 20000 }),
    registerHeading.waitFor({ state: "visible", timeout: 20000 }),
    landingHeading.waitFor({ state: "visible", timeout: 20000 }),
  ]);
}

async function assertNoHorizontalOverflow(page) {
  const payload = await page.evaluate(() => {
    document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
    const root = document.documentElement;
    const body = document.body;
    const width = Math.max(root.scrollWidth, body ? body.scrollWidth : 0);
    const overflow = Math.max(0, width - window.innerWidth);
    const offenders = Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          text: (element.textContent || "").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > window.innerWidth + 2 || item.left < -2)
      .slice(0, 8);
    return { overflow, offenders };
  });
  assert(
    payload.overflow <= 2,
    `horizontal overflow is ${payload.overflow}px; offenders=${JSON.stringify(payload.offenders)}`
  );
  return payload.overflow;
}

async function assertVisibleAndEnabled(locator, label) {
  await waitForVisible(locator.first(), label);
  const enabled = await locator.first().isEnabled().catch(() => true);
  assert(enabled, `${label} is visible but disabled`);
}

async function assertElementInInitialViewport(page, locator, label) {
  const box = await locator.first().boundingBox();
  assert(box, `${label} has no bounding box`);
  const viewport = page.viewportSize();
  assert(box.y < viewport.height, `${label} is below the initial viewport`);
  assert(box.x + box.width > 0 && box.x < viewport.width, `${label} is horizontally outside the viewport`);
}

async function assertNoTextClipping(page) {
  const clipped = await page.evaluate(() => {
    const selectors = [
      "button",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      ".panel-subtitle",
      ".heroLead",
      ".landing p",
      ".caseMeta span",
      ".metaRow span",
      ".scenario-category-chip",
      ".hint-badge",
      ".result-summary li",
      ".scenario-card-footer span",
    ];

    return selectors
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1 || style.visibility === "hidden") return false;
        const clipsX = ["hidden", "clip"].includes(style.overflowX);
        const clipsY = ["hidden", "clip"].includes(style.overflowY);
        return (
          (clipsX && element.scrollWidth > element.clientWidth + 2) ||
          (clipsY && element.scrollHeight > element.clientHeight + 2)
        );
      })
      .slice(0, 8)
      .map((element) => ({
        selector: element.tagName.toLowerCase(),
        text: (element.textContent || "").trim().slice(0, 120),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      }));
  });

  assert(clipped.length === 0, `text clipping detected: ${JSON.stringify(clipped)}`);
}

async function assertNoOverlap(page, pairs) {
  for (const [firstSelector, secondSelector] of pairs) {
    const overlap = await page.evaluate(
      ([aSelector, bSelector]) => {
        const first = document.querySelector(aSelector);
        const second = document.querySelector(bSelector);
        if (!first || !second) return null;
        const a = first.getBoundingClientRect();
        const b = second.getBoundingClientRect();
        if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) return null;
        const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        return { width, height, area: width * height };
      },
      [firstSelector, secondSelector]
    );
    if (overlap) {
      assert(overlap.area <= 2, `${firstSelector} overlaps ${secondSelector}: ${JSON.stringify(overlap)}`);
    }
  }
}

async function assertContainedInViewport(page, selector, label) {
  const box = await page.locator(selector).first().boundingBox();
  assert(box, `${label} has no bounding box`);
  const viewport = page.viewportSize();
  assert(box.x >= -2, `${label} starts outside left viewport edge`);
  assert(box.y >= -2, `${label} starts outside top viewport edge`);
  assert(box.x + box.width <= viewport.width + 2, `${label} exceeds right viewport edge`);
  assert(box.y + box.height <= viewport.height + 2, `${label} exceeds bottom viewport edge`);
  assert(box.height <= viewport.height + 2, `${label} is taller than viewport`);
}

async function assertHomeCollectionCards(page, viewport) {
  const result = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[class*="collectionColumn"] [class*="coverCaseCard"]'));
    return cards.slice(0, 6).map((card) => {
      const artwork = card.querySelector('[class*="coverCaseArtwork"]');
      const body = card.querySelector('[class*="coverCaseBody"]');
      const cardRect = card.getBoundingClientRect();
      const artworkRect = artwork?.getBoundingClientRect();
      const bodyRect = body?.getBoundingClientRect();
      return {
        cardWidth: Math.round(cardRect.width),
        cardHeight: Math.round(cardRect.height),
        artworkWidth: artworkRect ? Math.round(artworkRect.width) : 0,
        artworkHeight: artworkRect ? Math.round(artworkRect.height) : 0,
        bodyWidth: bodyRect ? Math.round(bodyRect.width) : 0,
      };
    });
  });

  assert(result.length >= 6, `expected six home collection cards, got ${result.length}`);

  for (const [index, item] of result.entries()) {
    if (viewport.width >= 1024) {
      assert(item.cardWidth >= 420, `home collection card ${index} is too narrow: ${item.cardWidth}px`);
      assert(item.artworkWidth >= 145, `home collection artwork ${index} is too narrow: ${item.artworkWidth}px`);
      assert(item.artworkHeight <= 280, `home collection artwork ${index} is too tall: ${item.artworkHeight}px`);
      assert(item.bodyWidth >= 220, `home collection body ${index} is too narrow: ${item.bodyWidth}px`);
    } else if (viewport.width >= 720) {
      assert(item.cardWidth >= 560, `tablet home collection card ${index} is too narrow: ${item.cardWidth}px`);
      assert(item.artworkHeight <= 330, `tablet home collection artwork ${index} is too tall: ${item.artworkHeight}px`);
    } else {
      assert(item.cardWidth >= viewport.width - 80, `mobile home collection card ${index} is too narrow: ${item.cardWidth}px`);
      assert(item.artworkHeight <= 260, `mobile home collection artwork ${index} is too tall: ${item.artworkHeight}px`);
    }
  }
}

async function runVisualChecks(page, { kind, name, viewport, ctas = [], initialViewport = [], overlapPairs = [], contained = [], customChecks = [] }) {
  const overflowPx = await assertNoHorizontalOverflow(page);
  await assertNoTextClipping(page);

  for (const item of ctas) {
    await assertVisibleAndEnabled(item.locator, item.label);
  }
  for (const item of initialViewport) {
    await assertElementInInitialViewport(page, item.locator, item.label);
  }
  if (overlapPairs.length) {
    await assertNoOverlap(page, overlapPairs);
  }
  for (const item of contained) {
    await assertContainedInViewport(page, item.selector, item.label);
  }
  for (const check of customChecks) {
    await check(page, viewport);
  }

  const screenshotPath = await screenshot(page, `${kind}-${name}-${viewport.name}`);
  report.visualChecks.push({
    kind,
    name,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    overflowPx,
    ctas: ctas.map((item) => item.label),
    overlapPairs,
    contained: contained.map((item) => item.label),
    customChecks: customChecks.length,
    screenshot: screenshotPath,
  });
}

async function captureResponsiveState(page, name, options = {}) {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    if (options.focus) {
      await options.focus(page).scrollIntoViewIfNeeded().catch(() => {});
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.waitForTimeout(150);
    await runVisualChecks(page, {
      kind: "state",
      name,
      viewport,
      ctas: options.ctas ? options.ctas(page) : [],
      initialViewport: options.initialViewport ? options.initialViewport(page) : [],
      overlapPairs: options.overlapPairs || [],
      contained: options.contained || [],
    });
  }
}

async function discoverContentRoutes(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await createTrackedPage(context);
  await page.goto(`${BASE_URL}/cases`, { waitUntil: "networkidle" });
  const caseHref = await page.locator('a[href^="/cases/"]:has-text("Dosyayı İncele")').first().getAttribute("href");
  const categoryHref = await page.locator('a[href^="/cases/category/"]').first().getAttribute("href");
  await context.close();
  assert(caseHref, "No case detail route found from /cases");
  assert(categoryHref, "No category route found from /cases");
  return { caseHref, categoryHref };
}

async function routeSmoke(browser, route, name, viewport, ctasFactory) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await createTrackedPage(context);
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  if (route === "/play") {
    await waitForPlayReady(page);
  }
  await runVisualChecks(page, {
    kind: "route",
    name,
    viewport,
    ctas: ctasFactory(page),
    initialViewport: name === "play" ? [{ locator: page.getByRole("button", { name: "Giriş Yap" }).first(), label: "play login CTA" }] : [],
    customChecks: name === "home" ? [assertHomeCollectionCards] : [],
  });
  await context.close();
}

function routeDefinitions(routes) {
  return [
    {
      route: "/",
      name: "home",
      ctas: (page) => [
        { locator: page.getByRole("link", { name: "Vaka Kataloğu" }).first(), label: "home catalog CTA" },
        { locator: page.getByRole("link", { name: "Oyuna Başla" }).first(), label: "home play CTA" },
      ],
    },
    {
      route: "/cases",
      name: "cases",
      ctas: (page) => [
        { locator: page.getByRole("link", { name: "Oyuna Başla" }).first(), label: "cases play CTA" },
        { locator: page.locator('a:has-text("Dosyayı İncele")').first(), label: "cases detail CTA" },
      ],
    },
    {
      route: routes.caseHref,
      name: "case-detail",
      ctas: (page) => [
        { locator: page.getByRole("link", { name: "Oyuna Başla" }).first(), label: "case play CTA" },
        { locator: page.getByRole("link", { name: "Vaka Kataloğu" }).first(), label: "case catalog CTA" },
      ],
    },
    {
      route: routes.categoryHref,
      name: "category-detail",
      ctas: (page) => [
        { locator: page.getByRole("link", { name: "Vaka Kataloğu" }).first(), label: "category catalog CTA" },
        { locator: page.getByRole("link", { name: "Oyuna Başla" }).first(), label: "category play CTA" },
      ],
    },
    {
      route: "/play",
      name: "play",
      ctas: (page) => [
        { locator: page.getByRole("button", { name: "Giriş Yap" }).first(), label: "play login CTA" },
        { locator: page.getByRole("button", { name: "Kayıt Ol" }).first(), label: "play register CTA" },
      ],
    },
  ];
}

async function authenticate(page) {
  const email = TEST_EMAIL;
  await page.goto(`${BASE_URL}/play`, { waitUntil: "networkidle" });
  await waitForPlayReady(page);

  const scenarioHeading = page.getByRole("heading", { name: "Senaryolar" });
  if (await scenarioHeading.isVisible().catch(() => false)) {
    report.authMode = "existing-session";
    return email;
  }

  const loginButton = page.getByRole("button", { name: /Giriş/i }).first();
  if (await loginButton.isVisible().catch(() => false)) {
    await loginButton.click();
  }

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Giriş Yap" }).last().click();

  await scenarioHeading.waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
  if (await scenarioHeading.isVisible().catch(() => false)) {
    report.authMode = "reused-account";
    return email;
  }

  const registerButton = page.getByRole("button", { name: "Kayıt Ol" }).first();
  if (await registerButton.isVisible().catch(() => false)) {
    await registerButton.click();
  }

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  const confirmInput = page.locator('input[name="passwordConfirm"]');
  if (await confirmInput.isVisible().catch(() => false)) {
    await confirmInput.fill(PASSWORD);
  }
  await page.getByRole("button", { name: "Kayıt Ol" }).last().click();

  const loginHeading = page.getByRole("heading", { name: "Giriş Yap" });
  await Promise.race([
    scenarioHeading.waitFor({ state: "visible", timeout: 15000 }),
    loginHeading.waitFor({ state: "visible", timeout: 15000 }),
  ]).catch(() => {});

  if (await loginHeading.isVisible().catch(() => false)) {
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole("button", { name: "Giriş Yap" }).last().click();
  }

  await waitForVisible(scenarioHeading, "scenario list after auth");
  report.authMode = "created-account";
  return email;
}

async function playFullCaseWithResponsiveCaptures(page) {
  await captureResponsiveState(page, "logged-out-landing", {
    ctas: (currentPage) => [
      { locator: currentPage.locator(".landing .cta-row button").first(), label: "landing login CTA" },
      { locator: currentPage.locator(".landing .cta-row button").nth(1), label: "landing register CTA" },
    ],
    initialViewport: (currentPage) => [
      { locator: currentPage.locator(".landing .cta-row button").first(), label: "landing login CTA" },
    ],
  });

  report.userEmail = await authenticate(page);
  await captureResponsiveState(page, "scenario-list", {
    ctas: (currentPage) => [
      { locator: currentPage.locator(".scenario-list .card").first(), label: "first scenario card" },
    ],
  });

  await waitForVisible(page.locator(".scenario-list .card").first(), "scenario card");
  await page.locator(".scenario-list .card").first().click();
  await waitForVisible(page.getByRole("button", { name: /Soruşturmayı Başlat/ }), "start session button");
  await captureResponsiveState(page, "scenario-selected", {
    ctas: (currentPage) => [
      { locator: currentPage.getByRole("button", { name: /Soruşturmayı Başlat/ }), label: "start investigation CTA" },
    ],
  });

  await page.getByRole("button", { name: /Soruşturmayı Başlat/ }).click();
  await waitForVisible(page.getByRole("button", { name: /Şüpheliler/ }), "suspects tab");
  await captureResponsiveState(page, "suspects-tab", {
    ctas: (currentPage) => [
      { locator: currentPage.locator(".character-summary-card").first(), label: "first suspect card" },
      { locator: currentPage.getByRole("button", { name: /Final Kararına Geç/ }), label: "final decision CTA" },
    ],
  });

  await page.locator(".character-summary-card").first().click();
  await waitForVisible(page.locator(".character-detail-expanded").first(), "expanded suspect detail");
  await captureResponsiveState(page, "suspect-detail", {
    focus: (currentPage) => currentPage.locator(".character-detail-expanded").first(),
    ctas: (currentPage) => [
      { locator: currentPage.getByRole("button", { name: /Final Kararına Geç/ }), label: "final decision CTA" },
    ],
  });

  await page.getByRole("button", { name: /Belgeler/ }).click();
  await waitForVisible(page.locator(".media-list li").first(), "document card");
  await captureResponsiveState(page, "documents-tab", {
    ctas: (currentPage) => [
      { locator: currentPage.getByRole("button", { name: /Final Kararına Geç/ }), label: "final decision CTA" },
    ],
  });

  await page.getByRole("button", { name: /Sorgulama/ }).click();
  await waitForVisible(page.locator(".character-select-card").first(), "character card");
  await page.locator(".character-select-card").first().click();
  await waitForVisible(page.locator(".modal-content"), "interrogation modal");
  await captureResponsiveState(page, "interrogation-modal", {
    focus: (currentPage) => currentPage.locator(".modal-content"),
    ctas: (currentPage) => [
      { locator: currentPage.locator(".suggestion-chip").first(), label: "question suggestion CTA" },
      { locator: currentPage.getByRole("button", { name: "Kapat" }), label: "close modal CTA" },
    ],
    contained: [{ selector: ".modal-content", label: "interrogation modal" }],
  });

  const firstSuggestion = page.locator(".suggestion-chip").first();
  if (await firstSuggestion.isVisible().catch(() => false)) {
    await firstSuggestion.click();
  } else {
    await page.locator('textarea[placeholder="Sorunuzu yazın..."]').fill("Olay sırasında neredeydin?");
  }
  await page.getByRole("button", { name: "Soruyu Sor" }).click();
  await waitForVisible(page.locator(".message.assistant").first(), "suspect answer", 30000);
  await captureResponsiveState(page, "conversation-view", {
    focus: (currentPage) => currentPage.locator(".message.assistant").first(),
    ctas: (currentPage) => [
      { locator: currentPage.getByRole("button", { name: "Kapat" }), label: "close modal CTA" },
    ],
    contained: [{ selector: ".modal-content", label: "interrogation modal" }],
  });

  await page.getByRole("button", { name: "Kapat" }).click();
  await page.getByRole("button", { name: /İpuçları/ }).click();
  await page.getByRole("button", { name: /İpucu Kullan/ }).click();
  await waitForVisible(page.locator(".hint-list li").first(), "hint item", 15000);
  await captureResponsiveState(page, "hints-tab", {
    ctas: (currentPage) => [
      { locator: currentPage.getByRole("button", { name: /Final Kararına Geç/ }), label: "final decision CTA" },
    ],
  });

  await page.getByRole("button", { name: /Final Kararına Geç/ }).click();
  await waitForVisible(page.locator(".final-panel"), "final panel");
  await captureResponsiveState(page, "final-form", {
    focus: (currentPage) => currentPage.locator(".final-panel"),
    ctas: (currentPage) => [
      { locator: currentPage.getByRole("button", { name: "Kararı Gönder" }), label: "submit final CTA" },
    ],
    overlapPairs: [
      [".app-header", ".final-panel"],
      [".app-header", ".stage-header"],
    ],
  });

  await page.locator('.final-panel input[type="checkbox"]').first().check();
  await page
    .locator(".final-panel textarea")
    .fill(
      "Zaman çizelgesi, kanıt notları ve sorgu cevabındaki çelişkiler bu şüphelinin fırsat ve motivasyon sahibi olduğunu gösteriyor."
    );
  await page.getByRole("button", { name: "Kararı Gönder" }).click();
  await waitForVisible(page.locator(".result"), "final result", 45000);
  await captureResponsiveState(page, "final-result", {
    focus: (currentPage) => currentPage.locator(".result"),
    ctas: (currentPage) => [
      { locator: currentPage.getByText("Tüm değerlendirmeyi göster"), label: "full feedback toggle" },
    ],
    overlapPairs: [
      [".app-header", ".result"],
      [".app-header", ".final-panel"],
    ],
  });
  report.finalResultText = await page.locator(".result").innerText();
}

(async () => {
  await fs.rm(ARTIFACT_DIR, { recursive: true, force: true });
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const routes = await step("discover content routes", () => discoverContentRoutes(browser));
    const definitions = routeDefinitions(routes);

    await step("responsive route smoke", async () => {
      for (const viewport of VIEWPORTS) {
        for (const definition of definitions) {
          await routeSmoke(browser, definition.route, definition.name, viewport, definition.ctas);
        }
      }
    });

    await step("responsive full gameplay", async () => {
      const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
      const page = await createTrackedPage(context);
      await page.goto(`${BASE_URL}/play`, { waitUntil: "networkidle" });
      await waitForPlayReady(page);
      await playFullCaseWithResponsiveCaptures(page);
      await context.close();
    });

    assert(report.consoleErrors.length === 0, `Console errors found: ${report.consoleErrors.length}`);
    assert(report.responseFailures.length === 0, `500 responses found: ${report.responseFailures.length}`);
    report.status = "passed";
  } catch (error) {
    report.status = "failed";
    report.error = error.message;
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    await browser.close();
    await fs.writeFile(
      path.join(ARTIFACT_DIR, "report.json"),
      JSON.stringify(report, null, 2)
    );
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
