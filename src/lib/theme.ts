import { createSignal } from "solid-js";

export type Theme = "light" | "dark";

const STORAGE_KEY = "solid-zh-theme";

// 与 styles/tokens.css 中两套主题的 --paper 保持一致
const THEME_COLOR: Record<Theme, string> = {
  light: "#f2eee3",
  dark: "#0f171d",
};

export const [theme, setThemeSignal] = createSignal<Theme>(
  document.documentElement.dataset.theme === "dark" ? "dark" : "light"
);

function syncThemeColor(next: Theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[next]);
}

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 隐私模式等场景会禁用存储，主题切换不应因此中断
  }
  syncThemeColor(next);
  setThemeSignal(next);
}

export function toggleTheme() {
  setTheme(theme() === "dark" ? "light" : "dark");
}
