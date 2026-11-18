import { useLocation, useParams } from "@solidjs/router";
import { Meta, Title } from "@solidjs/meta";
import {
  createEffect,
  createMemo,
  createSignal,
  Errored,
  Loading,
  Show,
  type Accessor,
} from "solid-js";
import { dynamic } from "@solidjs/web";
import { DocsShell } from "../components/DocsShell";
import { getDoc } from "../data/docs";
import { prefersReducedMotion } from "../lib/prefers";
import NotFound from "./NotFound";

// <Errored> 的 fallback 收到的是错误访问器（2.0 改成 accessor），
// 在 memo 里读一次再窄化类型
function ErrorText(props: { err: Accessor<unknown> }) {
  const message = createMemo(() => {
    const error = props.err();
    return error instanceof Error ? error.message : "未知错误";
  });
  return <p>{message()}</p>;
}

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

  // createResource 在 2.0 被移除。章节代码先在函数体里启动加载（不把 promise
  // 留在 compute 中），再用异步 memo 解出默认导出；没就绪时由 <Loading> 显示骨架。
  const module = props.doc.load();
  const Page = createMemo(async () => (await module).default);
  const Chapter = dynamic(Page);

  const [activeId, setActiveId] = createSignal(
    props.doc.headings[0]?.id ?? ""
  );

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  // 滚动监听：compute 只等章节模块落地，测量与监听都放在 apply 里，
  // 清理函数取代 1.x 的 onCleanup
  createEffect(
    async () => {
      await module;
      return props.doc.slug;
    },
    () => {
      let frame = 0;
      const update = () => {
        frame = 0;
        const elements = props.doc.headings
          .map((heading) => document.getElementById(heading.id))
          .filter((element): element is HTMLElement => element != null);
        if (elements.length === 0) return;
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

      // 内容要等 <Loading> 揭示后才在文档里，量测推到下一帧
      const mount = requestAnimationFrame(() => {
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      });

      return () => {
        cancelAnimationFrame(mount);
        window.removeEventListener("scroll", onScroll);
        if (frame !== 0) cancelAnimationFrame(frame);
      };
    }
  );

  // hash 定位：追踪 location.hash，同样等章节就绪后再滚动
  createEffect(
    async () => {
      const hash = location.hash;
      await module;
      return hash;
    },
    (hash) => {
      const frame = requestAnimationFrame(() => {
        if (hash) {
          document.getElementById(hash.slice(1))?.scrollIntoView({
            block: "start",
          });
        } else {
          window.scrollTo({ top: 0 });
        }
      });
      return () => cancelAnimationFrame(frame);
    }
  );

  return (
    <>
      <Title>{props.doc.title} · Solid 中文</Title>
      <Meta name="description" content={props.doc.summary} />

      <DocsShell
        doc={props.doc}
        activeId={activeId()}
        onNavigate={scrollToHeading}
      >
        <Errored
          fallback={(err, reset) => (
            <div class="doc-load-error">
              <strong>这一章没有成功加载</strong>
              <ErrorText err={err} />
              <button type="button" class="btn btn-ghost btn-sm" onClick={reset}>
                重新加载
              </button>
            </div>
          )}
        >
          <Loading fallback={<DocSkeleton />}>
            <Chapter />
          </Loading>
        </Errored>
      </DocsShell>
    </>
  );
}
