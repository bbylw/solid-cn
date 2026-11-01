const fs = require("fs");
const path = require("path");
const { chromium, chromeExecutable } = require("./_browser");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, ".research", "visual");
const BASE = "https://solid.localhost";
const EXECUTABLE = chromeExecutable();

const routes = ["/", "/docs", "/docs/signals", "/docs/stores", "/docs/data-fetching", "/404-check"];

(async () => {
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    headless: true,
  });
  const report = [];

  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "zh-CN",
    });
    await context.addInitScript(
      (value) => localStorage.setItem("solid-zh-theme", value),
      theme
    );
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const issues = await page.evaluate(() => {
        const parse = (value) => {
          const match = value.match(/rgba?\(([^)]+)\)/);
          if (!match) return null;
          const parts = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
          return [parts[0], parts[1], parts[2], parts[3] === undefined ? 1 : parts[3]];
        };
        const over = (fg, bg) => {
          const a = fg[3];
          return [
            fg[0] * a + bg[0] * (1 - a),
            fg[1] * a + bg[1] * (1 - a),
            fg[2] * a + bg[2] * (1 - a),
            1,
          ];
        };
        const channel = (value) => {
          value /= 255;
          return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
        };
        const luminance = (color) =>
          0.2126 * channel(color[0]) + 0.7152 * channel(color[1]) + 0.0722 * channel(color[2]);
        const ratio = (a, b) => {
          const x = luminance(a);
          const y = luminance(b);
          return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
        };
        const background = (el) => {
          const layers = [];
          let node = el;
          while (node && node.nodeType === 1) {
            const cs = getComputedStyle(node);
            const own = parse(cs.backgroundColor);
            if (cs.backgroundImage !== "none" && (!own || own[3] < 0.99)) return null;
            if (own && own[3] > 0) layers.push(own);
            node = node.parentElement;
          }
          let bg = [255, 255, 255, 1];
          for (let i = layers.length - 1; i >= 0; i -= 1) bg = over(layers[i], bg);
          return bg;
        };
        const results = [];
        for (const el of document.querySelectorAll("body *")) {
          if (el.closest("pre, code, .shiki, .sr-only, script, style, svg")) continue;
          const direct = Array.from(el.childNodes)
            .filter((node) => node.nodeType === 3)
            .map((node) => node.textContent)
            .join("")
            .trim();
          if (!direct || direct.length > 160) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || cs.color === "rgba(0, 0, 0, 0)") {
            continue;
          }
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          const bg = background(el);
          if (!bg) continue;
          const fg = parse(cs.color);
          if (!fg || fg[3] === 0) continue;
          const composited = over(fg, bg);
          const value = ratio(composited, bg);
          const size = parseFloat(cs.fontSize);
          const weight = Number(cs.fontWeight) || 400;
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          const min = large ? 3 : 4.5;
          if (value < min) {
            results.push({
              text: direct.slice(0, 45),
              selector: `${el.tagName.toLowerCase()}.${Array.from(el.classList)
                .slice(0, 2)
                .join(".")}`,
              ratio: Math.round(value * 100) / 100,
              min,
              color: cs.color,
              bg: `rgb(${bg.slice(0, 3).map((n) => Math.round(n)).join(", ")})`,
              size,
              weight,
            });
          }
        }
        const seen = new Set();
        return results
          .sort((a, b) => a.ratio - b.ratio)
          .filter((item) => {
            const key = `${item.selector}|${item.text}|${item.ratio}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 25);
      });
      report.push({ theme, route, issues });
    }

    await context.close();
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "contrast-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
