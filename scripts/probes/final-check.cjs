const fs = require("fs");
const path = require("path");
const { chromium } = require(
  "C:/Users/bbylw/AppData/Local/npm-cache/_npx/13ab0715f9f30c2e/node_modules/playwright-core"
);

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, ".research", "visual", "final");
const BASE = "https://solid.localhost";
const EXECUTABLE =
  "C:/Users/bbylw/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe";

fs.mkdirSync(OUT, { recursive: true });

const shots = [];
const checks = {};

async function makePage(browser, { width, height, theme = "light", reduced = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale: "zh-CN",
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await context.addInitScript(
    (value) => localStorage.setItem("solid-zh-theme", value),
    theme
  );
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return { context, page, errors };
}

async function go(page, route) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  shots.push(name);
}

async function scrollTo(page, selector, offset = -80) {
  await page.evaluate(
    ({ selector, offset }) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`missing ${selector}`);
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY + offset,
        behavior: "instant",
      });
    },
    { selector, offset }
  );
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    headless: true,
  });

  // Desktop, light
  const light = await makePage(browser, { width: 1440, height: 900 });
  const page = light.page;

  await go(page, "/");
  await shot(page, "home-light-top");
  await page.evaluate(() => window.scrollTo(0, 760));
  await page.waitForTimeout(400);
  await shot(page, "home-light-runonce");

  await go(page, "/docs");
  await shot(page, "docsindex-light-top");

  await go(page, "/docs/signals");
  await shot(page, "signals-light-top");
  await scrollTo(page, "#create-signal");
  await shot(page, "signals-light-create");
  await scrollTo(page, "#derived");
  await shot(page, "signals-light-derived");
  await scrollTo(page, "#lab");
  await shot(page, "signals-light-lab");

  await go(page, "/docs/reactivity");
  await scrollTo(page, "#signals-and-subscribers");
  await shot(page, "reactivity-light-subscribers");

  await go(page, "/docs/data-fetching");
  await page.waitForTimeout(800);
  await scrollTo(page, "#lab");
  await shot(page, "datafetching-light-lab");

  await go(page, "/docs/stores");
  await scrollTo(page, "#lab");
  await shot(page, "stores-light-lab");

  await go(page, "/404-check");
  await shot(page, "notfound-light");

  // Search dialog + copy + resource timing
  await go(page, "/");
  await page.click(".search-trigger");
  await page.waitForTimeout(200);
  await page.fill(".search-dialog input", "resource");
  await page.waitForTimeout(350);
  await shot(page, "search-light-results");
  await page.fill(".search-dialog input", "zzzzzz");
  await page.waitForTimeout(300);
  await shot(page, "search-light-empty");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  await go(page, "/docs/signals");
  await light.context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: BASE,
  });
  await page.locator(".copy-btn").first().click();
  await page.waitForTimeout(250);
  checks.copyState = await page.locator(".copy-btn").first().getAttribute("data-state");
  checks.copyText = await page.evaluate(async () => {
    try {
      return (await navigator.clipboard.readText()).slice(0, 60);
    } catch (err) {
      return `ERROR: ${err.message}`;
    }
  });

  await go(page, "/docs/data-fetching");
  await page.waitForTimeout(900);
  await page.locator(".flow-buttons .lab-step-btn").nth(1).click();
  await page.waitForTimeout(80);
  checks.resourceLoading = await page.isVisible(".resource-loading");
  await page.waitForTimeout(850);
  checks.resourceSecondUser = await page.locator(".profile-head h4").textContent();
  await page.getByRole("button", { name: "模拟失败" }).click();
  await page.locator(".flow-buttons .lab-step-btn").nth(2).click();
  await page.waitForTimeout(850);
  checks.resourceError = await page.isVisible(".resource-error");
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await page.waitForTimeout(850);
  checks.resourceRecovered = await page.isVisible(".profile-card");
  checks.resourceRecoveredName = await page
    .locator(".profile-head h4")
    .textContent();
  checks.requestCount = await page.locator(".profile-stats b").nth(1).textContent();

  checks.lightErrors = light.errors;
  await light.context.close();

  // Desktop, dark
  const dark = await makePage(browser, {
    width: 1440,
    height: 900,
    theme: "dark",
  });
  await go(dark.page, "/");
  await shot(dark.page, "home-dark-top");
  await go(dark.page, "/docs/signals");
  await shot(dark.page, "signals-dark-top");
  await scrollTo(dark.page, "#create-signal");
  await shot(dark.page, "signals-dark-create");
  await scrollTo(dark.page, "#derived");
  await shot(dark.page, "signals-dark-derived");
  await go(dark.page, "/docs/stores");
  await scrollTo(dark.page, "#lab");
  await shot(dark.page, "stores-dark-lab");
  checks.darkErrors = dark.errors;
  await dark.context.close();

  // Tablet
  const tablet = await makePage(browser, { width: 834, height: 1112 });
  await go(tablet.page, "/");
  await shot(tablet.page, "home-tablet-top");
  await go(tablet.page, "/docs/stores");
  await shot(tablet.page, "stores-tablet-top");
  await scrollTo(tablet.page, "#lab");
  await shot(tablet.page, "stores-tablet-lab");
  checks.tabletErrors = tablet.errors;
  await tablet.context.close();

  // Mobile
  const mobile = await makePage(browser, { width: 390, height: 844 });
  await go(mobile.page, "/");
  await shot(mobile.page, "home-mobile-top");
  await mobile.page.evaluate(() => window.scrollTo(0, 900));
  await mobile.page.waitForTimeout(400);
  await shot(mobile.page, "home-mobile-runonce");
  await go(mobile.page, "/docs/signals");
  await shot(mobile.page, "signals-mobile-top");
  await scrollTo(mobile.page, "#create-signal");
  await shot(mobile.page, "signals-mobile-create");
  await go(mobile.page, "/docs/data-fetching");
  await mobile.page.waitForTimeout(800);
  await scrollTo(mobile.page, "#lab");
  await shot(mobile.page, "datafetching-mobile-lab");
  checks.mobileErrors = mobile.errors;
  await mobile.context.close();

  await browser.close();
  fs.writeFileSync(
    path.join(OUT, "report.json"),
    JSON.stringify({ checks, shots }, null, 2)
  );
  console.log(JSON.stringify({ checks, shots }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
