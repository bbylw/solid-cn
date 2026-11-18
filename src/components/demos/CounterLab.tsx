import { createEffect, createMemo, createSignal, For } from "solid-js";

type Write = { id: number; code: string; value: number };

export function CounterLab() {
  const [count, setCount] = createSignal(0);
  const [step, setStep] = createSignal(1);
  const [writes, setWrites] = createSignal<Write[]>([]);
  const [settled, setSettled] = createSignal(0);
  let sequence = 0;

  const double = createMemo(() => count() * 2);
  const parity = createMemo(() =>
    Math.abs(count()) % 2 === 1 ? "奇数" : "偶数"
  );

  // 两段式：compute 只负责读取并登记依赖；apply 在这一帧提交后运行，
  // 那里是命令式作用域，写状态是合法的（组件体与 compute 里都不行）
  createEffect(
    () => count(),
    (value) => {
      setSettled(value);
    }
  );

  // 2.0 写入不会立刻改变读取，所以先把下一帧的值算出来再记录
  const log = (code: string, next: number) => {
    sequence += 1;
    const entry: Write = { id: sequence, code, value: next };
    setWrites((list) => [entry, ...list].slice(0, 3));
  };

  const shift = (direction: 1 | -1) => {
    const delta = direction * step();
    const next = count() + delta;
    setCount((value) => value + delta);
    log(`setCount((c) => c ${delta < 0 ? "−" : "+"} ${Math.abs(delta)})`, next);
  };

  const reset = () => {
    setCount(0);
    log("setCount(0)", 0);
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
            <span>double = createMemo(...)</span>
            <b>{double()}</b>
          </div>
          <div class="counter-derived">
            <span>parity = createMemo(...)</span>
            <b>{parity()}</b>
          </div>
          <div class="counter-derived">
            <span>effect apply 看到 count</span>
            <b>{settled()}</b>
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
                  aria-pressed={step() === value ? "true" : "false"}
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
        <p class="lab-log-title">写入记录（提交后生效）</p>
        <For
          each={writes()}
          fallback={<p class="lab-log-empty">点击按钮，观察 count 的写入。</p>}
        >
          {(write) => (
            <div class="lab-log-row">
              <span class="lab-log-code">{write.code}</span>
              <span class="lab-log-result">count 下一帧 = {write.value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
