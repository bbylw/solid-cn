import { For } from "solid-js";
import {
  DISCORD_URL,
  DOCS_URL,
  GITHUB_URL,
  OPEN_COLLECTIVE_URL,
  PLAYGROUND_URL,
  REDDIT_URL,
} from "../data/docs";

const columns = [
  {
    title: "文档",
    links: [
      { label: "快速开始", href: "/docs/getting-started" },
      { label: "响应式模型", href: "/docs/reactivity" },
      { label: "信号与派生", href: "/docs/signals" },
      { label: "Store 状态", href: "/docs/stores" },
    ],
  },
  {
    title: "生态",
    links: [
      { label: "Solid Start", href: "https://start.solidjs.com" },
      {
        label: "solid-primitives",
        href: "https://github.com/solidjs-community/solid-primitives",
      },
      { label: "Kobalte", href: "https://kobalte.dev" },
      { label: "Solid Labels", href: "https://github.com/LXSMNSYC/solid-labels" },
    ],
  },
  {
    title: "社区",
    links: [
      { label: "Discord", href: DISCORD_URL },
      { label: "Reddit", href: REDDIT_URL },
      { label: "GitHub", href: GITHUB_URL },
      { label: "Open Collective", href: OPEN_COLLECTIVE_URL },
    ],
  },
  {
    title: "官方",
    links: [
      { label: "solidjs.com", href: "https://www.solidjs.com" },
      { label: "docs.solidjs.com", href: DOCS_URL },
      { label: "在线演练场", href: PLAYGROUND_URL },
      {
        label: "交互式教程",
        href: "https://docs.solidjs.com/tutorial",
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer class="site-footer">
      <div class="shell">
        <div class="footer-main">
          <div>
            <img
              src="/brand/solid-lockup-dark.svg"
              alt="Solid"
              class="footer-lockup"
              width="174"
              height="48"
            />
            <p class="footer-note">
              把 Solid 的官方文档与 README 整理成一套中文阅读路径。示例代码可以直接复制运行，交互演示由 Solid 本身驱动。
            </p>
          </div>
          <div class="footer-cols">
            <For each={columns}>
              {(column) => (
                <div class="footer-col">
                  <h3>{column.title}</h3>
                  <For each={column.links}>
                    {(link) => (
                      <ShowLink href={link.href}>{link.label}</ShowLink>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
        <div class="footer-bottom">
          <span>
            <a href="/docs/api">API 速查</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              源码与勘误
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function ShowLink(props: { href: string; children: string }) {
  // 路由 2.0 没有 A 组件：站内链接就是普通 <a href>
  const external = () => !props.href.startsWith("/");
  return (
    <a
      href={props.href}
      target={external() ? "_blank" : undefined}
      rel={external() ? "noreferrer" : undefined}
    >
      {props.children}
    </a>
  );
}
