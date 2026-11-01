import { MetaProvider } from "@solidjs/meta";
import { Route, Router, useLocation } from "@solidjs/router";
import {
  createEffect,
  lazy,
  on,
  onCleanup,
  onMount,
  Suspense,
  type ParentProps,
} from "solid-js";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { SearchDialog } from "./components/SearchDialog";
import { menuOpen, searchOpen, setMenuOpen, setSearchOpen } from "./lib/ui-state";

const Home = lazy(() => import("./pages/Home"));
const DocsIndex = lazy(() => import("./pages/DocsIndex"));
const DocPage = lazy(() => import("./pages/DocPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Layout(props: ParentProps) {
  const location = useLocation();

  onMount(() => {
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
    onCleanup(() => window.removeEventListener("keydown", onKeyDown));
  });

  createEffect(
    on(
      () => location.pathname,
      () => {
        setMenuOpen(false);
        setSearchOpen(false);
      },
      { defer: true }
    )
  );

  createEffect(() => {
    document.body.style.overflow = menuOpen() || searchOpen() ? "hidden" : "";
  });

  return (
    <>
      <a href="#main" class="skip-link">
        跳到主要内容
      </a>
      <SiteHeader />
      <main id="main">
        <Suspense
          fallback={
            <div class="route-loading shell" aria-live="polite">
              正在加载页面……
            </div>
          }
        >
          {props.children}
        </Suspense>
      </main>
      <SiteFooter />
      <SearchDialog />
    </>
  );
}

export default function App() {
  return (
    <MetaProvider>
      <Router root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/docs" component={DocsIndex} />
        <Route path="/docs/:slug" component={DocPage} />
        <Route path="*" component={NotFound} />
      </Router>
    </MetaProvider>
  );
}
