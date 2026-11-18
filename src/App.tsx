import { createRouter, useLocation } from "@solidjs/router";
import { createEffect, lazy, Loading, onSettled, type ParentProps } from "solid-js";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { SearchDialog } from "./components/SearchDialog";
import { menuOpen, searchOpen, setMenuOpen, setSearchOpen } from "./lib/ui-state";

// Solid 2.0 的路由改成配置式：createRouter 在 JSX 之外把路由表建好，
// 返回的实例本身就是 provider 组件，渲染它时用一个 render prop 当根布局。
const Router = createRouter({
  routes: [
    { path: "/", component: lazy(() => import("./pages/Home")) },
    { path: "/docs", component: lazy(() => import("./pages/DocsIndex")) },
    { path: "/docs/:slug", component: lazy(() => import("./pages/DocPage")) },
    { path: "*404", component: lazy(() => import("./pages/NotFound")) },
  ],
});

function Layout(props: ParentProps) {
  const location = useLocation();

  // onMount 在 2.0 换成 onSettled：清理函数由它返回，不再单独注册 onCleanup
  onSettled(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(!searchOpen());
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // 拆分式 effect：compute 只负责追踪，写操作留在 apply 里
  createEffect(
    () => location.pathname,
    () => {
      setMenuOpen(false);
      setSearchOpen(false);
    },
    { defer: true }
  );

  createEffect(
    () => menuOpen() || searchOpen(),
    (locked) => {
      document.body.style.overflow = locked ? "hidden" : "";
    }
  );

  return (
    <>
      <a href="#main" class="skip-link">
        跳到主要内容
      </a>
      <SiteHeader />
      <main id="main">
        <Loading
          fallback={
            <div class="route-loading shell" aria-live="polite">
              正在加载页面……
            </div>
          }
        >
          {props.children}
        </Loading>
      </main>
      <SiteFooter />
      <SearchDialog />
    </>
  );
}

export default function App() {
  return (
    <Router>
      {(props) => <Layout>{props.children}</Layout>}
    </Router>
  );
}
