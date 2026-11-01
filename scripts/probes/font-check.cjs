const fs = require("fs");
const path = require("path");
const { chromium } = require(
  "C:/Users/bbylw/AppData/Local/npm-cache/_npx/13ab0715f9f30c2e/node_modules/playwright-core"
);

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, ".research", "visual");
const BASE = "https://solid.localhost";
const EXECUTABLE =
  "C:/Users/bbylw/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe";

const routes = [
  "/",
  "/docs",
  "/docs/getting-started",
  "/docs/signals",
  "/docs/effects",
  "/docs/stores",
  "/docs/context",
  "/docs/components",
  "/docs/control-flow",
  "/docs/data-fetching",
  "/docs/ssr",
  "/docs/api",
];

const MONO = /IBM Plex Mono/i;
const CJK = /[\u3400-\u9fff]/;
const CJK_FONTS = /YaHei|PingFang|Hiragino|Noto Sans SC|Source Han|SimSun|SimHei|Song|Hei|Kai|Ming/i;

(async () => {
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
  const client = await context.newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");

  const report = [];

  for (const route of routes) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);

    const tagged = await page.evaluate(({ monoSource, cjkSource }) => {
      const mono = new RegExp(monoSource, "i");
      const cjk = new RegExp(cjkSource);
      const out = [];
      let index = 0;
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest("pre, code, .shiki, script, style")) continue;
        const direct = Array.from(el.childNodes)
          .filter((node) => node.nodeType === 3)
          .map((node) => node.textContent)
          .join("")
          .trim();
        if (!direct || !cjk.test(direct)) continue;
        if (!mono.test(getComputedStyle(el).fontFamily)) continue;
        const key = `fontcheck-${index++}`;
        el.setAttribute("data-fontcheck", key);
        out.push({
          key,
          text: direct.slice(0, 40),
          selector: `${el.tagName.toLowerCase()}.${Array.from(el.classList)
            .slice(0, 2)
            .join(".")}`,
        });
      }
      return out;
    }, { monoSource: MONO.source, cjkSource: CJK.source });

    const byKey = new Map(tagged.map((item) => [item.key, item]));
    const { root } = await client.send("DOM.getDocument", { depth: 0 });
    const found = await client.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: "[data-fontcheck]",
    });

    for (const nodeId of found.nodeIds) {
      const { attributes } = await client.send("DOM.getAttributes", { nodeId });
      const flat = {};
      for (let i = 0; i < attributes.length; i += 2) {
        flat[attributes[i]] = attributes[i + 1];
      }
      const key = flat["data-fontcheck"];
      const item = byKey.get(key);
      if (!item) continue;
      let fonts = [];
      try {
        const result = await client.send("CSS.getPlatformFontsForNode", {
          nodeId,
        });
        fonts = result.fonts.map((font) => ({
          family: font.familyName,
          glyphs: font.glyphCount,
        }));
      } catch (err) {
        fonts = [{ family: `ERROR: ${err.message}`, glyphs: 0 }];
      }
      const families = fonts.map((font) => font.family);
      const hasCjk = families.some((family) => CJK_FONTS.test(family));
      const usesMonoForCjk = families.length > 0 && !hasCjk;
      report.push({
        route,
        ...item,
        fonts,
        verdict: usesMonoForCjk ? "CJK_IN_MONO" : "CJK_FALLBACK_OK",
      });
    }
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(
    path.join(OUT, "font-report.json"),
    JSON.stringify(report, null, 2)
  );

  const grouped = [];
  for (const item of report) {
    const key = `${item.route} ${item.selector}`;
    if (!grouped.includes(key)) grouped.push(key);
  }

  console.log(
    JSON.stringify(
      {
        tagged: report.length,
        violations: report.filter((item) => item.verdict === "CJK_IN_MONO"),
        unique: grouped.length,
        sample: report.slice(0, 25),
      },
      null,
      2
    )
  );

  await context.close();
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
