import { createMemo, createSignal, For } from "solid-js";

type Write = { id: number; code: string; value: number };

export function CounterLab() {
  const [count, setCount] = createSignal(0);
  const [step, setStep] = createSignal(1);
  const [writes, setWrites] = createSignal<Write[]>([]);
  let sequence = 0;

  const double = createMemo(() => count() * 2);
  const parity = createMemo(() => (Math.abs(count()) % 2 === 1 ? "奇数" : "偶数"));

  const log = (code: string) => {
    sequence += 1;
    setWrites((list) =>
      [{ id: sequence, code, value: count() }, ...list].slice(0, 3)
    );
  };

  const shift = (direction: 1 | -1) => {
    setCount((value) => value + direction * step());
    log(`setCount((c) => c ${direction === 1 ? "+" : "-"} ${step()})`);
  };

  const reset = () => {
    setCount(0);
    log("setCount(0)");
  };

  return (
    <div class="lab">
      <div class="lab-stage">
        <div class="lab-value">
          <span class="counter-value">{count()}</span>
          <span class="counter-unit">count()</span>
        </div>
        <div class="lab-derived">
          <div class="counter-derived">
            <span>doubleCount = createMemo(...)</span>
            <b>{double()}</b>
          </div>
          <div class="counter-derived">
            <span>parity = createMemo(...)</span>
            <b>{parity()}</b>
          </div>
        </div>
        <div class="lab-controls">
          <button
            type="button"
            class="signal-btn"
            onClick={() => shift(-1)}
            aria-label={`减去 ${step()}`}
          >
            -{step()}
          </button>
          <button
            type="button"
            class="signal-btn"
            onClick={() => shift(1)}
            aria-label={`加上 ${step()}`}
          >
            +{step()}
          </button>
          <button type="button" class="signal-btn label" onClick={reset}>
            重置
          </button>
          <span class="signal-spacer" />
          <div class="lab-step" role="group" aria-label="步长">
            <For each={[1, 5, 10]}>
              {(value) => (
                <button
                  type="button"
                  class="lab-step-btn"
                  aria-pressed={step() === value}
                  onClick={() => setStep(value)}
                >
                  {value}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
      <div class="lab-log" aria-live="polite">
        <p class="lab-log-title">写入记录</p>
        <For
          each={writes()}
          fallback={<p class="lab-log-empty">点击按钮，观察 count 的写入。</p>}
        >
          {(write) => (
            <div class="lab-log-row">
              <span class="lab-log-code">{write.code}</span>
              <span class="lab-log-result">count = {write.value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
