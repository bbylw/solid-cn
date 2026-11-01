import { writeFileSync, mkdirSync } from "node:fs";
import { load } from "cheerio";

const PAGES = [
  "quick-start",
  "concepts/intro-to-reactivity",
  "concepts/signals",
  "concepts/derived-values/derived-signals",
  "concepts/derived-values/memos",
  "concepts/effects",
  "concepts/stores",
  "concepts/context",
  "concepts/components/basics",
  "concepts/components/props",
  "concepts/understanding-jsx",
  "concepts/control-flow/conditional-rendering",
  "concepts/control-flow/list-rendering",
  "concepts/control-flow/portal",
  "concepts/control-flow/error-boundary",
  "concepts/refs",
  "guides/fetching-data",
  "advanced-concepts/fine-grained-reactivity",
  "reference/basic-reactivity/create-signal",
  "reference/basic-reactivity/create-effect",
  "reference/basic-reactivity/create-memo",
  "reference/basic-reactivity/create-resource",
  "reference/store-utilities/create-store",
  "reference/lifecycle/on-mount",
  "reference/lifecycle/on-cleanup",
  "reference/components/show",
  "reference/components/for",
  "reference/components/switch-and-match",
  "reference/components/suspense",
  "reference/rendering/render-to-string",
  "reference/rendering/hydrate",
];

const OUT = ".research/docs";
mkdirSync(OUT, { recursive: true });

function text($, el) {
  return $(el).find("h1,h2,h3,h4").remove().end().text().replace(/\s+/g, " ").trim();
}

function toMarkdown($, root) {
  const out = [];
  const scope = $("main article").length ? $("main article").first() : root.find("main").first();

  const render = (el, depth = 0) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;
    if (["style", "script", "nav", "svg", "button"].includes(tag)) return;
    if (/^h[2-4]$/.test(tag)) {
      out.push(`\n${"#".repeat(Number(tag[1]))} ${$el.text().replace(/\s+/g, " ").trim()}\n`);
      return;
    }
    if (tag === "p") {
      const t = $el.text().replace(/\s+/g, " ").trim();
      if (t) out.push(t + "\n");
      return;
    }
    if (tag === "pre") {
      const cls = $el.find("code").attr("class") || $el.attr("class") || "";
      const lang =
        $el.attr("data-language") ||
        (cls.match(/language-([\w-]+)/) || cls.match(/lang-([\w-]+)/) || [])[1] ||
        "";
      out.push(`\n\`\`\`${lang}\n${$el.text().trim()}\n\`\`\`\n`);
      return;
    }
    if (tag === "ul" || tag === "ol") {
      $el.children("li").each((i, li) => {
        out.push(`${tag === "ol" ? `${i + 1}.` : "-"} ${$(li).text().replace(/\s+/g, " ").trim()}`);
      });
      out.push("");
      return;
    }
    if (tag === "table") {
      $el.find("tr").each((_, tr) => {
        const cells = $(tr)
          .find("th,td")
          .map((__, c) => $(c).text().replace(/\s+/g, " ").trim())
          .get();
        out.push(`| ${cells.join(" | ")} |`);
      });
      out.push("");
      return;
    }
    if (tag === "aside") {
      out.push(`\n> ${$el.text().replace(/\s+/g, " ").trim()}\n`);
      return;
    }
    if (["div", "section", "article", "main", "details", "figure", "blockquote"].includes(tag)) {
      $el.children().each((_, child) => render(child, depth + 1));
      return;
    }
    const t = $el.text().replace(/\s+/g, " ").trim();
    if (t) out.push(t + "\n");
  };

  scope.each((_, el) => render(el));
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

async function fetchPage(slug) {
  const url = `https://docs.solidjs.com/${slug}`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; solid-zh-research)" } });
  if (!res.ok) throw new Error(`${res.status} ${slug}`);
  const html = await res.text();
  const $ = load(html);
  const title = $("h1").first().text().trim();
  const md = `# ${title}\n\n${toMarkdown($, $("body"))}`;
  const file = `${OUT}/${slug.replaceAll("/", "__")}.md`;
  writeFileSync(file, md);
  console.log("ok", slug, md.length);
}

const queue = [...PAGES];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const slug = queue.shift();
    try {
      await fetchPage(slug);
    } catch (e) {
      console.error("FAIL", slug, e.message);
    }
  }
});
await Promise.all(workers);
