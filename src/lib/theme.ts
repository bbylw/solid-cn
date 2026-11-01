import { createSignal } from "solid-js";

export type Theme = "light" | "dark";

const STORAGE_KEY = "solid-zh-theme";

export const [theme, setThemeSignal] = createSignal<Theme>(
  document.documentElement.dataset.theme === "dark" ? "dark" : "light"
);

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  localStorage.setItem(STORAGE_KEY, next);
  setThemeSignal(next);
}

export function toggleTheme() {
  setTheme(theme() === "dark" ? "light" : "dark");
}
