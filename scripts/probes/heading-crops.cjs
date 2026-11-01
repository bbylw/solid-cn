const fs = require("fs");
const path = require("path");
const { chromium, chromeExecutable } = require("./_browser");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, ".research", "visual", "final");
const BASE = "https://solid.localhost";
const EXECUTABLE = chromeExecutable();

const targets = [
  ["heading-section01", ".section-head", 0],
  ["heading-features", ".features-layout", 0],
  ["heading-night", ".night-section .section-head", 0],
  ["heading-start", ".start-band", 0],
  ["heading-community", ".community-grid", 0],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "zh-CN",
  });
  await context.addInitScript(() =>
    localStorage.setItem("solid-zh-theme", "light")
  );
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  for (const [name, selector] of targets) {
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`missing ${selector}`);
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 90,
        behavior: "instant",
      });
    }, selector);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(name, await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const target = el.querySelector("h1, h2") || el;
      const cs = getComputedStyle(target);
      return {
        text: target.textContent.trim().slice(0, 80),
        width: Math.round(target.getBoundingClientRect().width),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        lines: Math.round(target.getBoundingClientRect().height / parseFloat(cs.lineHeight)),
      };
    }, selector));
  }

  await context.close();
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
