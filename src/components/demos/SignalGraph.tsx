import { createSignal, For, on, createEffect } from "solid-js";
import { prefersReducedMotion } from "../../lib/prefers";

type LogEntry = { seq: number; value: string };

export function SignalGraph() {
  const [count, setCount] = createSignal(3);
  const [log, setLog] = createSignal<LogEntry[]>([{ seq: 0, value: "3" }]);
  let sequence = 0;
  let sourceNode: SVGGElement | undefined;
  let derivedNode: SVGGElement | undefined;
  let parityNode: SVGGElement | undefined;
  let textNode: SVGGElement | undefined;
  let badgeNode: SVGGElement | undefined;
  let hotEdges: SVGPathElement[] = [];

  const double = () => count() * 2;
  const odd = () => Math.abs(count()) % 2 === 1;
  const parityText = () => (odd() ? "奇数" : "偶数");

  const update = (delta: number) => {
    setCount((value) => value + delta);
    sequence += 1;
    setLog((entries) =>
      [{ seq: sequence, value: String(count()) }, ...entries].slice(0, 3)
    );
  };

  const reset = () => {
    setCount(0);
    sequence += 1;
    setLog((entries) =>
      [{ seq: sequence, value: "0" }, ...entries].slice(0, 3)
    );
  };

  createEffect(
    on(
      count,
      () => {
        if (prefersReducedMotion()) return;
        const pulse = (
          element: SVGGElement | SVGPathElement | undefined,
          strong: boolean
        ) => {
          if (!element) return;
          element.animate(
            strong
              ? [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]
              : [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }],
            { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
          );
        };
        pulse(sourceNode, false);
        pulse(derivedNode, false);
        pulse(parityNode, false);
        pulse(textNode, false);
        pulse(badgeNode, false);
        hotEdges.forEach((edge) => pulse(edge, true));
      },
      { defer: true }
    )
  );

  return (
    <section class="signal-panel" aria-label="实时信号依赖图演示">
      <div class="signal-panel-head">
        <span class="signal-title">SIGNAL GRAPH / counter</span>
        <span class="signal-state">
          <span class="dot" />
          响应中
        </span>
      </div>

      <div class="signal-panel-body">
        <svg
          class="graph-desktop"
          viewBox="0 0 540 336"
          role="img"
          aria-label={`当前 count 为 ${count()}，double 为 ${double()}，奇偶状态为 ${parityText()}。`}
        >
          <path class="edge" d="M152 168 C 178 168, 178 76, 204 76" />
          <path class="edge" d="M152 168 C 178 168, 178 260, 204 260" />
          <path class="edge" d="M356 76 H 404" />
          <path class="edge" d="M356 260 H 404" />

          <path
            ref={(element) => hotEdges.push(element)}
            class="edge-hot"
            d="M152 168 C 178 168, 178 76, 204 76"
          />
          <path
            ref={(element) => hotEdges.push(element)}
            class="edge-hot"
            d="M152 168 C 178 168, 178 260, 204 260"
          />
          <path
            ref={(element) => hotEdges.push(element)}
            class="edge-hot"
            d="M356 76 H 404"
          />
          <path
            ref={(element) => hotEdges.push(element)}
            class="edge-hot"
            d="M356 260 H 404"
          />

          <g class="node node-source" ref={(element) => (sourceNode = element)}>
            <rect x="16" y="136" width="136" height="64" rx="3" />
            <text class="node-tag" x="140" y="158" text-anchor="end">
              SIGNAL
            </text>
            <text class="node-label" x="28" y="158">
              count
            </text>
            <text class="node-value" x="28" y="188">
              {count()}
            </text>
          </g>

          <g class="node node-derived" ref={(element) => (derivedNode = element)}>
            <rect x="204" y="44" width="152" height="64" rx="3" />
            <text class="node-tag" x="344" y="66" text-anchor="end">
              MEMO
            </text>
            <text class="node-label" x="216" y="66">
              double
            </text>
            <text class="node-value" x="216" y="96">
              {double()}
            </text>
          </g>

          <g class="node node-derived" ref={(element) => (parityNode = element)}>
            <rect x="204" y="228" width="152" height="64" rx="3" />
            <text class="node-tag" x="344" y="250" text-anchor="end">
              MEMO
            </text>
            <text class="node-label" x="216" y="250">
              parity
            </text>
            <text class="node-value-cjk" x="216" y="280">
              {parityText()}
            </text>
          </g>

          <g class="node node-output" ref={(element) => (textNode = element)}>
            <rect x="404" y="44" width="120" height="64" rx="3" />
            <text class="node-tag" x="512" y="66" text-anchor="end">
              DOM
            </text>
            <text class="node-label" x="416" y="66">
              button
            </text>
            <text class="node-value" x="416" y="96">
              {double()}
            </text>
          </g>

          <g class="node node-output" ref={(element) => (badgeNode = element)}>
            <rect x="404" y="228" width="120" height="64" rx="3" />
            <text class="node-tag" x="512" y="250" text-anchor="end">
              DOM
            </text>
            <text class="node-label" x="416" y="250">
              badge
            </text>
            <text class="node-value-cjk" x="416" y="280">
              {parityText()}
            </text>
          </g>
        </svg>

        <div class="signal-readout">
          <div class="signal-readout-row">
            <span>count()</span>
            <b>{count()}</b>
          </div>
          <div class="signal-readout-row">
            <span>double()</span>
            <b>{double()}</b>
          </div>
          <div class="signal-readout-row">
            <span>parity()</span>
            <b>{parityText()}</b>
          </div>
          <div class="signal-readout-row">
            <span>button.textContent</span>
            <b>{double()}</b>
          </div>
        </div>
      </div>

      <div class="signal-controls">
        <button
          type="button"
          class="signal-btn"
          onClick={() => update(-1)}
          aria-label="把 count 减一"
        >
          -1
        </button>
        <button
          type="button"
          class="signal-btn"
          onClick={() => update(1)}
          aria-label="把 count 加一"
        >
          +1
        </button>
        <button
          type="button"
          class="signal-btn label"
          onClick={() => update(5)}
        >
          加 5
        </button>
        <button type="button" class="signal-btn label" onClick={reset}>
          重置
        </button>
        <span class="signal-spacer" />
        <span class="signal-hint">只有订阅者会重新执行</span>
      </div>

      <div class="signal-log" aria-live="polite" aria-label="更新日志">
        <For each={log()}>
          {(entry) => (
            <div class="signal-log-row">
              <span class="seq">#{String(entry.seq).padStart(2, "0")}</span>
              <span class="path">count</span>
              <span class="value">= {entry.value}</span>
            </div>
          )}
        </For>
        <span class="signal-log-idle">每次写入都会同步通知订阅者</span>
      </div>
    </section>
  );
}
