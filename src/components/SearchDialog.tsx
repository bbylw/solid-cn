import { useNavigate } from "@solidjs/router";
import { Portal } from "solid-js/web";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from "solid-js";
import Search from "lucide-solid/icons/search";
import { searchDocs, type SearchResult } from "../lib/search";
import { searchOpen, setSearchOpen } from "../lib/ui-state";

const shortcut =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘K"
    : "Ctrl K";

function Highlight(props: { text: string; query: string }) {
  const parts = createMemo(() => {
    const query = props.query.trim();
    if (!query) return [{ text: props.text, hit: false }];
    const haystack = props.text.toLowerCase();
    const needle = query.toLowerCase();
    const result: { text: string; hit: boolean }[] = [];
    let cursor = 0;
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      if (index > cursor) {
        result.push({ text: props.text.slice(cursor, index), hit: false });
      }
      result.push({ text: props.text.slice(index, index + needle.length), hit: true });
      cursor = index + needle.length;
      index = haystack.indexOf(needle, cursor);
    }
    if (cursor < props.text.length) {
      result.push({ text: props.text.slice(cursor), hit: false });
    }
    return result;
  });

  return (
    <span>
      <For each={parts()}>
        {(part) => (part.hit ? <mark>{part.text}</mark> : part.text)}
      </For>
    </span>
  );
}

export function SearchDialog() {
  const navigate = useNavigate();
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal(0);
  let inputRef: HTMLInputElement | undefined;
  let dialogRef: HTMLDivElement | undefined;
  let previousFocus: HTMLElement | null = null;

  const results = createMemo(() => searchDocs(query()));

  const close = () => {
    setSearchOpen(false);
    setQuery("");
    setActive(0);
    previousFocus?.focus();
  };

  const go = (result: SearchResult | undefined) => {
    if (!result) return;
    setSearchOpen(false);
    setQuery("");
    setActive(0);
    navigate(`/docs/${result.slug}${result.hash ? `#${result.hash}` : ""}`, {
      scroll: true,
    });
  };

  createEffect(() => {
    if (searchOpen()) {
      previousFocus = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => inputRef?.focus());
    }
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results().length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(results()[active()]);
      return;
    }
    if (event.key === "Tab") {
      const focusables = dialogRef?.querySelectorAll<HTMLElement>(
        "input, button:not([disabled])"
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <Portal>
      <Show when={searchOpen()}>
        <div
          class="search-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            class="search-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="搜索文档"
            onKeyDown={onKeyDown}
          >
            <div class="search-field">
              <Search size={18} aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query()}
                placeholder="搜索章节、概念或 API"
                aria-label="搜索文档"
                aria-controls="search-results"
                aria-autocomplete="list"
                aria-activedescendant={
                  results().length > 0 ? `search-option-${active()}` : undefined
                }
                onInput={(event) => {
                  setQuery(event.currentTarget.value);
                  setActive(0);
                }}
              />
              <button type="button" class="search-close" onClick={close}>
                Esc
              </button>
            </div>

            <div class="search-results" id="search-results" role="listbox">
              <Show
                when={results().length > 0}
                fallback={
                  <div class="search-empty">
                    <strong>没有找到「{query()}」</strong>
                    换一个关键词试试，例如“信号”“Store”或“SSR”。
                  </div>
                }
              >
                <For each={results()}>
                  {(result, index) => (
                    <button
                      type="button"
                      class="search-result"
                      id={`search-option-${index()}`}
                      role="option"
                      aria-selected={active() === index()}
                      data-active={active() === index()}
                      onMouseMove={() => setActive(index())}
                      onClick={() => go(result)}
                    >
                      <span class="search-result-title">
                        <Highlight text={result.title} query={query()} />
                        <span class="search-result-kind">{result.kind}</span>
                      </span>
                      <span class="search-result-context">
                        <Highlight text={result.context} query={query()} />
                      </span>
                    </button>
                  )}
                </For>
              </Show>
            </div>

            <div class="search-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                选择
              </span>
              <span>
                <kbd>Enter</kbd>
                打开
              </span>
              <span>
                <kbd>Esc</kbd>
                关闭
              </span>
              <span style={{ "margin-left": "auto" }}>{shortcut} 随时唤起</span>
            </div>
          </div>
        </div>
      </Show>
    </Portal>
  );
}
