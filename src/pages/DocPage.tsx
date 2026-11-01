import { useLocation, useParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { DocsShell } from "../components/DocsShell";
import { getDoc } from "../data/docs";
import NotFound from "./NotFound";

const reduceMotion = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function DocSkeleton() {
  return (
    <div class="doc-skeleton" aria-hidden="true">
      <div class="skeleton-line" style={{ width: "62%" }} />
      <div class="skeleton-line" style={{ width: "94%" }} />
      <div class="skeleton-line" style={{ width: "88%" }} />
      <div class="skeleton-line" style={{ width: "72%" }} />
      <div class="skeleton-line" style={{ width: "40%", "margin-top": "28px" }} />
      <div class="skeleton-line" style={{ width: "90%" }} />
      <div class="skeleton-line" style={{ width: "84%" }} />
    </div>
  );
}

export default function DocPage() {
  const params = useParams();
  const doc = createMemo(() => getDoc(params.slug));

  return (
    <Show when={doc()} keyed fallback={<NotFound />}>
      {(entry) => <DocView doc={entry} />}
    </Show>
  );
}

function DocView(props: {
  doc: NonNullable<ReturnType<typeof getDoc>>;
}) {
  const location = useLocation();
  const [content] = createResource(async () => (await props.doc.load()).default);
  const [activeId, setActiveId] = createSignal(
    props.doc.headings[0]?.id ?? ""
  );

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: reduceMotion() ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  createEffect(() => {
    if (!content()) return;

    const elements = props.doc.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element != null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = 122;
      let current = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= threshold) {
          current = element.id;
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    onCleanup(() => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    });
  });

  createEffect(() => {
    const loaded = content();
    const hash = location.hash;
    if (!loaded) return;

    requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash.slice(1))?.scrollIntoView({
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0 });
      }
    });
  });

  return (
    <>
      <Title>{props.doc.title} · Solid 中文</Title>
      <Meta name="description" content={props.doc.summary} />

      <DocsShell
        doc={props.doc}
        activeId={activeId()}
        onNavigate={scrollToHeading}
      >
        <ErrorBoundary
          fallback={(error, reset) => (
            <div class="doc-load-error">
              <strong>这一章没有成功加载</strong>
              <p>{error instanceof Error ? error.message : "未知错误"}</p>
              <button type="button" class="btn btn-ghost btn-sm" onClick={reset}>
                重新加载
              </button>
            </div>
          )}
        >
          <Suspense fallback={<DocSkeleton />}>
            <Show when={content()}>
              {(Page) => <Dynamic component={Page()} />}
            </Show>
          </Suspense>
        </ErrorBoundary>
      </DocsShell>
    </>
  );
}
