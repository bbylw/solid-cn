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

const chapters = [
  "getting-started",
  "reactivity",
  "signals",
  "effects",
  "stores",
  "context",
  "components",
  "control-flow",
  "data-fetching",
  "ssr",
  "api",
];

const CJK = /[\u3400-\u9fff]/;
const MONO = /IBM Plex Mono/i;

fs.mkdirSync(OUT, { recursive: true });

async function inspect(page, route, label, theme) {
  const data = await page.evaluate(
    ({ route }) => {
      const cjk = /[\u3400-\u9fff]/;
      const mono = /IBM Plex Mono/i;
      const overflow = {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyWidth: Math.round(document.body.scrollWidth),
        viewport: window.innerWidth,
      };

      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest("pre, code, .shiki")) continue;
        const text = (el.textContent || "").trim();
        if (!text || text.length > 80 || !cjk.test(text)) continue;
        const direct = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join("")
          .trim();
        if (!cjk.test(direct)) continue;
        const cs = getComputedStyle(el);
        if (!mono.test(cs.fontFamily)) continue;
        const key = `${el.tagName.toLowerCase()}.${Array.from(el.classList)
          .slice(0, 2)
          .join(".")}`;
        offenders.push({ key, text: direct.slice(0, 40) });
      }

      const headings = Array.from(
        document.querySelectorAll(".doc-article h2[id], .doc-article h3[id]")
      ).map((h) => h.id);

      const links = Array.from(
        document.querySelectorAll(".doc-article a[href^='/']")
      ).map((a) => a.getAttribute("href"));

      return {
        route,
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() || "",
        overflow,
        offenders,
        headings,
        internalLinks: Array.from(new Set(links)),
        doc: true,
      };
    },
    { route }
  );
  data.label = label;
  data.theme = theme;
  data.missingImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute("src"))
  );
  return data;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    headless: true,
  });
  const results = [];
  const errors = [];

  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "tablet", width: 834, height: 1112 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const theme of ["light", "dark"]) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        locale: "zh-CN",
      });
      await context.addInitScript((t) => {
        localStorage.setItem("solid-zh-theme", t);
      }, theme);
      const page = await context.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error")
          errors.push({ theme, vp: vp.name, url: page.url(), msg: msg.text() });
      });
      page.on("pageerror", (err) =>
        errors.push({
          theme,
          vp: vp.name,
          url: page.url(),
          msg: String(err),
        })
      );

      const routes = [
        ...["/", "/docs", `/docs/${chapters[0]}`, "/404-check"],
        ...chapters.slice(1).map((slug) => `/docs/${slug}`),
      ];

      for (const route of routes) {
        await page.goto(BASE + route, { waitUntil: "networkidle" });
        await page.waitForTimeout(350);
        const label = `${vp.name}-${theme}-${route.replace(/\//g, "_") || "_home"}`;
        const data = await inspect(page, route, label, theme);
        results.push(data);

        const isHomeOrDocs =
          route === "/" ||
          route === "/docs" ||
          route === "/docs/getting-started" ||
          route === "/docs/signals" ||
          route === "/docs/stores" ||
          route === "/docs/api" ||
          route === "/404-check";
        const shot =
          (vp.name === "desktop" && theme === "light" && isHomeOrDocs) ||
          (vp.name === "desktop" &&
            theme === "dark" &&
            (route === "/" || route === "/docs/signals")) ||
          (vp.name === "tablet" &&
            theme === "light" &&
            ["/", "/docs/signals", "/docs/stores"].includes(route)) ||
          (vp.name === "mobile" && isHomeOrDocs);
        if (shot) {
          await page.screenshot({
            path: path.join(OUT, `${label}.png`),
            fullPage: true,
          });
        }
      }

      await context.close();
    }
  }

  // Interaction pass (light desktop)
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "zh-CN",
  });
  await context.addInitScript(() => localStorage.setItem("solid-zh-theme", "light"));
  const page = await context.newPage();
  const interactions = {};

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.click(".search-trigger");
  await page.waitForTimeout(200);
  interactions.searchOpened = await page.isVisible(".search-dialog");
  await page.fill(".search-dialog input", "resource");
  await page.waitForTimeout(350);
  interactions.searchResults = await page.locator(".search-result").count();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  interactions.searchClosed = !(await page.isVisible(".search-dialog"));
  interactions.searchFocusReturned = await page.evaluate(
    () => document.activeElement?.classList.contains("search-trigger") ?? false
  );

  await page.click(".search-trigger");
  await page.waitForTimeout(150);
  await page.fill(".search-dialog input", "zzzzzz");
  await page.waitForTimeout(250);
  interactions.searchEmpty = await page.isVisible(".search-empty");
  await page.keyboard.press("Shift+Tab");
  await page.waitForTimeout(80);
  const trappedBack = await page.evaluate(
    () => !!document.activeElement?.closest(".search-dialog")
  );
  await page.keyboard.press("Tab");
  await page.waitForTimeout(80);
  const trappedForward = await page.evaluate(
    () => !!document.activeElement?.closest(".search-dialog")
  );
  interactions.searchFocusTrap = trappedBack && trappedForward;
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);

  await page.click(".search-trigger");
  await page.waitForTimeout(150);
  await page.fill(".search-dialog input", "resource");
  await page.waitForTimeout(300);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  interactions.searchEnterUrl = page.url();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(200);

  const themeButton = page.getByRole("button", { name: "切换到深色主题" });
  await themeButton.click();
  await page.waitForTimeout(150);
  interactions.themeDark = await page.evaluate(
    () => document.documentElement.dataset.theme
  );
  interactions.themeStored = await page.evaluate(() =>
    localStorage.getItem("solid-zh-theme")
  );
  await page.getByRole("button", { name: "切换到浅色主题" }).click();
  await page.waitForTimeout(150);

  await page.goto(BASE + "/docs/stores", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(500);
  interactions.scrollspyActive = await page.locator('.toc-link[aria-current="true"]').count();
  await page.click(".toc-link[href='#path-updates']");
  await page.waitForTimeout(500);
  interactions.hashAfterClick = await page.evaluate(() => location.hash);

  await page.goto(BASE + "/docs/signals", { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  const before = await page.locator(".counter-value").first().textContent();
  await page.locator(".signal-btn", { hasText: "+1" }).first().click();
  await page.waitForTimeout(120);
  const after = await page.locator(".counter-value").first().textContent();
  interactions.counterLab = { before, after };

  await page.goto(BASE + "/docs/data-fetching", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  interactions.resourceLoading = await page.isVisible(".resource-loading");
  await page.waitForTimeout(900);
  interactions.resourceReady = await page.isVisible(".profile-card");
  await page.getByRole("button", { name: /模拟失败/ }).click();
  await page.locator(".flow-buttons .lab-step-btn").nth(1).click();
  await page.waitForTimeout(900);
  interactions.resourceError = await page.isVisible(".resource-error");
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await page.waitForTimeout(900);
  interactions.resourceRecovered = await page.isVisible(".profile-card");

  await page.goto(BASE + "/docs/stores", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const toggle = page.locator(".store-toggle").first();
  const onlineBefore = await page.locator(".store-lab-stats strong").first().textContent();
  const pressedBefore = await toggle.getAttribute("aria-pressed");
  const pathBefore = await page.locator(".store-path code").textContent();
  await toggle.click();
  await page.waitForTimeout(200);
  const onlineAfter = await page.locator(".store-lab-stats strong").first().textContent();
  const pathAfter = await page.locator(".store-path code").textContent();
  await page.getByRole("button", { name: "新增成员" }).click();
  await page.waitForTimeout(200);
  interactions.storeLab = {
    pressedBefore,
    pressedAfter: await toggle.getAttribute("aria-pressed"),
    onlineBefore,
    onlineAfter,
    pathBefore,
    pathAfter,
    addPath: await page.locator(".store-path code").textContent(),
    rows: await page.locator(".store-row").count(),
  };

  await page.goto(BASE + "/404-check", { waitUntil: "networkidle" });
  interactions.notFoundVisible = await page.isVisible(".not-found");
  interactions.notFoundHasLinks =
    (await page.locator('.not-found a[href^="/"]').count()) > 0;

  // Internal link audit
  const links = new Set();
  for (const route of ["/", "/docs", ...chapters.map((slug) => `/docs/${slug}`)]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href^='/']")).map((a) =>
        a.getAttribute("href")
      )
    );
    for (const href of hrefs) {
      if (!href || href.startsWith("//")) continue;
      links.add(href.split("#")[0]);
    }
  }
  const brokenLinks = [];
  for (const href of links) {
    await page.goto(BASE + href, { waitUntil: "networkidle" });
    if (await page.locator(".not-found").count()) brokenLinks.push(href);
  }
  interactions.internalLinks = links.size;
  interactions.brokenLinks = brokenLinks;

  const reduced = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "zh-CN",
    reducedMotion: "reduce",
  });
  const rpage = await reduced.newPage();
  await rpage.goto(BASE + "/", { waitUntil: "networkidle" });
  interactions.reducedMotion = await rpage.evaluate(() => {
    const title = document.querySelector(".hero-title");
    const live = document.querySelector(".live-dot");
    return {
      titleAnimation: title ? getComputedStyle(title).animationDuration : null,
      liveAnimation: live ? getComputedStyle(live).animationDuration : null,
    };
  });
  await reduced.close();

  // Mobile menu
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "zh-CN",
  });
  await mobile.addInitScript(() =>
    localStorage.setItem("solid-zh-theme", "light")
  );
  const mpage = await mobile.newPage();
  await mpage.goto(BASE + "/", { waitUntil: "networkidle" });
  await mpage.getByRole("button", { name: "打开菜单" }).click();
  await mpage.waitForTimeout(300);
  interactions.mobileMenu = await mpage.isVisible(".mobile-menu");
  await mpage.screenshot({
    path: path.join(OUT, "mobile-menu-open.png"),
    fullPage: false,
  });

  await mobile.close();
  await context.close();
  await browser.close();

  const report = { results, errors, interactions };
  fs.writeFileSync(
    path.join(OUT, "report.json"),
    JSON.stringify(report, null, 2)
  );

  const badOverflow = results.filter(
    (r) =>
      r.overflow.scrollWidth > r.overflow.clientWidth + 1 ||
      r.overflow.bodyWidth > r.overflow.viewport + 1
  );
  const cjkMono = new Map();
  for (const r of results) {
    for (const o of r.offenders) {
      const k = o.key;
      if (!cjkMono.has(k)) cjkMono.set(k, { samples: new Set(), count: 0 });
      cjkMono.get(k).samples.add(o.text);
      cjkMono.get(k).count += 1;
    }
  }
  const missing = results
    .filter((r) => r.missingImages.length)
    .map((r) => ({ route: r.route, missingImages: r.missingImages }));

  console.log(
    JSON.stringify(
      {
        routesChecked: results.length,
        badOverflow: badOverflow.map((r) => ({ route: r.route, vp: r.label, overflow: r.overflow })),
        cjkMono: Array.from(cjkMono.entries()).map(([k, v]) => ({
          selector: k,
          count: v.count,
          samples: Array.from(v.samples).slice(0, 4),
        })),
        missingImages: missing.slice(0, 5),
        errors: errors.slice(0, 20),
        interactions,
      },
      null,
      2
    )
  );
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
