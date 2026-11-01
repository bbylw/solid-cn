import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { shikiHtml } from "./scripts/shiki-plugin";

export default defineConfig({
  // 部署说明：站点通过自定义域名 solid.ndjp.net（见 public/CNAME）发布在
  // GitHub Pages 的根路径，资产因此使用默认绝对路径 /assets/...。
  // 若改为子路径部署（如 <user>.github.io/solid-cn/），必须在这里设置
  // base: "/solid-cn/"，否则所有静态资源都会 404。
  plugins: [shikiHtml(), solid()],
  build: {
    target: "es2022",
    cssCodeSplit: false,
  },
});
