import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { shikiHtml } from "./scripts/shiki-plugin";

export default defineConfig({
  plugins: [shikiHtml(), solid()],
  build: {
    target: "es2022",
    cssCodeSplit: false,
  },
});
