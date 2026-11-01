import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import Menu from "lucide-solid/icons/menu";
import Moon from "lucide-solid/icons/moon";
import Search from "lucide-solid/icons/search";
import Sun from "lucide-solid/icons/sun";
import X from "lucide-solid/icons/x";
import { GITHUB_URL } from "../data/docs";
import { setMenuOpen, setSearchOpen, menuOpen } from "../lib/ui-state";
import { theme, toggleTheme } from "../lib/theme";

const navItems = [
  { href: "/", label: "首页", end: true },
  { href: "/docs", label: "文档", end: true },
  { href: "/docs/getting-started", label: "快速开始" },
  { href: "/docs/api", label: "API" },
];

const shortcut =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘K"
    : "Ctrl K";

function GithubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header class="site-header">
      <div class="header-inner shell">
        <A href="/" class="brand" aria-label="Solid 中文首页">
          <img
            src="/brand/solid-mark.svg"
            alt=""
            class="brand-mark"
            width="28"
            height="26"
          />
          <span class="brand-name">Solid</span>
        </A>

        <nav class="primary-nav" aria-label="主导航">
          <For each={navItems}>
            {(item) => (
              <A href={item.href} end={item.end}>
                {item.label}
              </A>
            )}
          </For>
        </nav>

        <div class="header-actions">
          <button
            type="button"
            class="search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="搜索文档"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search size={15} class="search-trigger-icon" aria-hidden="true" />
            <span class="search-trigger-label">搜索文档</span>
            <kbd>{shortcut}</kbd>
          </button>
          <button
            type="button"
            class="icon-btn"
            onClick={toggleTheme}
            aria-label={theme() === "dark" ? "切换到浅色主题" : "切换到深色主题"}
          >
            <Show when={theme() === "dark"} fallback={<Moon size={18} />}>
              <Sun size={18} />
            </Show>
          </button>
          <a
            class="icon-btn"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Solid GitHub 仓库"
          >
            <GithubMark />
          </a>
          <button
            type="button"
            class="icon-btn menu-btn"
            onClick={() => setMenuOpen(!menuOpen())}
            aria-expanded={menuOpen()}
            aria-controls="mobile-menu"
            aria-label={menuOpen() ? "关闭菜单" : "打开菜单"}
          >
            <Show when={menuOpen()} fallback={<Menu size={19} />}>
              <X size={19} />
            </Show>
          </button>
        </div>
      </div>

      <Show when={menuOpen()}>
        <div class="mobile-menu" id="mobile-menu">
          <button
            type="button"
            class="search-trigger mobile-menu-search"
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            <Search size={16} class="search-trigger-icon" aria-hidden="true" />
            <span class="search-trigger-label">搜索文档</span>
            <kbd>{shortcut}</kbd>
          </button>
          <nav class="mobile-menu-nav" aria-label="移动端导航">
            <For each={navItems}>
              {(item) => (
                <A href={item.href} end={item.end} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </A>
              )}
            </For>
            <A href="/docs/signals" onClick={() => setMenuOpen(false)}>
              信号与派生
            </A>
            <A href="/docs/stores" onClick={() => setMenuOpen(false)}>
              Store 状态
            </A>
            <A href="/docs/ssr" onClick={() => setMenuOpen(false)}>
              SSR 与水合
            </A>
          </nav>
          <div class="mobile-menu-foot">
            <span>Solid 中文学习站</span>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </Show>
    </header>
  );
}
