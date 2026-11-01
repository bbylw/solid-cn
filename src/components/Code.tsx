import { createSignal, For, onCleanup, Show, type JSX } from "solid-js";

export type ShikiSnippet = {
  html: string;
  code: string;
  lang: string;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function CopyButton(props: { code: string; label?: string }) {
  const [copied, setCopied] = createSignal(false);
  let timer: number | undefined;
  onCleanup(() => window.clearTimeout(timer));

  const onCopy = async () => {
    const ok = await copyText(props.code);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      class="copy-btn"
      data-state={copied() ? "copied" : undefined}
      onClick={onCopy}
      aria-label={copied() ? "已复制" : "复制代码"}
    >
      <span aria-live="polite">{copied() ? "已复制" : "复制"}</span>
    </button>
  );
}

export function CodeBlock(props: {
  data: ShikiSnippet;
  label?: string;
  copy?: boolean;
}) {
  return (
    <div class="codeblock">
      <Show when={props.label || props.copy !== false}>
        <div class="codeblock-bar">
          <span class="codeblock-label">
            <span>{props.label ?? props.data.lang.toUpperCase()}</span>
          </span>
          <Show when={props.copy !== false}>
            <CopyButton code={props.data.code} />
          </Show>
        </div>
      </Show>
      <div innerHTML={props.data.html} />
    </div>
  );
}

export type SnippetTab = {
  id: string;
  label: string;
  fileLabel?: string;
  data: ShikiSnippet;
};

export function SnippetTabs(props: {
  tabs: SnippetTab[];
  label: string;
  tone?: "light";
}) {
  const [active, setActive] = createSignal(props.tabs[0]?.id ?? "");
  const current = () =>
    props.tabs.find((tab) => tab.id === active()) ?? props.tabs[0];

  return (
    <div class="code-switcher">
      <div
        class="tab-row"
        role="tablist"
        aria-label={props.label}
        data-tone={props.tone}
      >
        <For each={props.tabs}>
          {(tab) => (
            <button
              type="button"
              role="tab"
              class="tab"
              aria-selected={active() === tab.id}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
      <Show when={current()}>
        {(tab) => (
          <CodeBlock data={tab().data} label={tab().fileLabel ?? tab().label} />
        )}
      </Show>
    </div>
  );
}

export function Callout(props: {
  title?: string;
  tone?: "warn";
  children: JSX.Element;
}) {
  return (
    <div class="callout" data-tone={props.tone}>
      <Show when={props.title}>
        <p class="callout-head">{props.title}</p>
      </Show>
      <div class="callout-body">{props.children}</div>
    </div>
  );
}

export function DemoFrame(props: {
  label: string;
  children: JSX.Element;
  note?: string;
}) {
  return (
    <div class="demo-frame">
      <div class="demo-frame-bar">
        <span>{props.label}</span>
        <span class="live">
          <span class="live-dot" />
          实时运行
        </span>
      </div>
      <div class="demo-frame-body">{props.children}</div>
      <Show when={props.note}>
        <p class="demo-note" style={{ padding: "0 16px 16px" }}>
          {props.note}
        </p>
      </Show>
    </div>
  );
}
