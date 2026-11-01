import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import type { Plugin } from "vite";
import { createHighlighter, type Highlighter } from "shiki";
import { COMMENT_COLOR, solidInk } from "./shiki-theme";

const LANGS = ["tsx", "jsx", "ts", "js", "bash", "json", "html", "css"];
const LANG_ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  javascript: "js",
};

export function shikiHtml(): Plugin {
  let highlighter: Highlighter | undefined;

  const getHighlighter = async () => {
    if (!highlighter) {
      highlighter = await createHighlighter({
        themes: [solidInk],
        langs: LANGS,
      });
    }
    return highlighter;
  };

  return {
    name: "solid-zh:shiki-html",
    enforce: "pre",
    async load(id) {
      const [path, query] = id.split("?");
      if (!path.endsWith(".txt") || !query?.split("&").includes("shiki")) return null;

      const source = await readFile(path, "utf8");
      const name = path.split(/[\\/]/).pop()!.replace(/\.txt$/, "");
      const rawLang = extname(name).slice(1) || "text";
      const lang = LANG_ALIASES[rawLang] ?? rawLang;
      const hl = await getHighlighter();

      const html = hl.codeToHtml(source, {
        lang: LANGS.includes(lang) ? lang : "text",
        theme: "solid-ink",
        transformers: [
          {
            span(node, _line, _col, _lineElement, token) {
              if (token.color?.toLowerCase() === COMMENT_COLOR) {
                node.properties = { ...node.properties, class: "tok-comment" };
              }
            },
          },
        ],
      });

      return `export default ${JSON.stringify({ html, code: source, lang })};`;
    },
  };
}
