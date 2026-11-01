import { A } from "@solidjs/router";
import { For, Show, type JSX } from "solid-js";
import {
  docs,
  docGroups,
  getAdjacent,
  GITHUB_URL,
  type DocEntry,
} from "../data/docs";

function SidebarContent() {
  return (
    <>
      <A href="/docs" class="sidebar-home" end>
        <span class="mono">Docs</span>
        <span>文档总览</span>
      </A>
      <For each={docGroups}>
        {(group) => (
          <div class="sidebar-group">
            <p class="sidebar-group-title">{group.name}</p>
            <For each={group.docs}>
              {(item) => (
                <A href={`/docs/${item.slug}`} class="sidebar-link">
                  <span class="num">{item.chapter}</span>
                  <span>{item.navTitle}</span>
                </A>
              )}
            </For>
          </div>
        )}
      </For>
    </>
  );
}

export function DocsShell(props: {
  doc: DocEntry;
  activeId: string;
  onNavigate: (id: string) => void;
  children: JSX.Element;
}) {
  let mobileNav: HTMLDetailsElement | undefined;
  const adjacent = () => getAdjacent(props.doc.slug);
  const docIndex = () => docs.findIndex((item) => item.slug === props.doc.slug);

  return (
    <div class="docs-shell">
      <aside class="docs-sidebar" aria-label="文档目录">
        <SidebarContent />
      </aside>

      <main class="docs-main">
        <details class="docs-mobile-nav" ref={mobileNav}>
          <summary>
            本文章节导航
            <span class="mono" style={{ "font-size": "10px", color: "var(--muted)" }}>
              {props.doc.chapter} / {String(docs.length).padStart(2, "0")}
            </span>
          </summary>
          <div class="docs-mobile-nav-body" onClick={() => {
            if (mobileNav) mobileNav.open = false;
          }}>
            <SidebarContent />
          </div>
        </details>

        <nav class="doc-breadcrumb" aria-label="面包屑">
          <A href="/docs">文档</A>
          <span class="slash">/</span>
          <span>{props.doc.group}</span>
          <span class="slash">/</span>
          <span aria-current="page">{props.doc.title}</span>
        </nav>

        <p class="doc-chapter">
          第 {props.doc.chapter} 章 · {props.doc.group}
        </p>
        <h1 class="doc-title" id="doc-title">
          {props.doc.title}
        </h1>
        <p class="doc-lede">{props.doc.summary}</p>

        <div class="doc-meta">
          <span>{props.doc.level}</span>
          <span class="dot" aria-hidden="true" />
          <span>阅读约 {props.doc.reading}</span>
          <span class="dot" aria-hidden="true" />
          <span>基于 Solid 1.9</span>
          <a href="https://docs.solidjs.com" target="_blank" rel="noreferrer">
            对照官方文档
          </a>
        </div>

        <article class="prose doc-article" aria-labelledby="doc-title">
          {props.children}
        </article>

        <nav class="doc-pager" aria-label="章节翻页">
          <Show when={adjacent().previous}>
            {(prev) => (
              <A href={`/docs/${prev().slug}`}>
                <span class="doc-pager-label">上一篇 · 第 {prev().chapter} 章</span>
                <span class="doc-pager-title">{prev().title}</span>
              </A>
            )}
          </Show>
          <Show when={adjacent().next}>
            {(next) => (
              <A href={`/docs/${next().slug}`} class="doc-pager-next">
                <span class="doc-pager-label">下一篇 · 第 {next().chapter} 章</span>
                <span class="doc-pager-title">{next().title}</span>
              </A>
            )}
          </Show>
        </nav>

        <p class="doc-foot-note">
          本章依据 Solid 官方文档与 README 整理，示例默认使用 TypeScript。
          发现错误或有更好的讲法，欢迎在{" "}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>{" "}
          提 issue。
          当前是第 {docIndex() + 1} / {docs.length} 章。
        </p>
      </main>

      <nav class="docs-toc" aria-label="本页目录">
        <p class="toc-title">本页内容</p>
        <For each={props.doc.headings}>
          {(heading) => (
            <a
              href={`#${heading.id}`}
              class="toc-link"
              data-depth={heading.depth}
              aria-current={props.activeId === heading.id ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                props.onNavigate(heading.id);
              }}
            >
              {heading.text}
            </a>
          )}
        </For>
      </nav>
    </div>
  );
}
