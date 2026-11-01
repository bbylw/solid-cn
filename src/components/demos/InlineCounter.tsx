import { createSignal } from "solid-js";

export function InlineCounter() {
  const [count, setCount] = createSignal(0);
  const [updates, setUpdates] = createSignal(0);

  const bump = (amount: number) => {
    setCount((value) => value + amount);
    setUpdates((value) => value + 1);
  };

  const reset = () => {
    setCount(0);
    setUpdates(0);
  };

  return (
    <div class="counter-instrument" aria-label="只运行一次的反例">
      <div class="counter-top">
        <span>COUNTER.TSX</span>
        <span class="counter-live">函数体保持静止</span>
      </div>
      <div class="counter-value-line">
        <span class="counter-value">{count()}</span>
        <span class="counter-unit">count()</span>
      </div>
      <div class="counter-actions">
        <button type="button" class="signal-btn" onClick={() => bump(1)}>
          +1
        </button>
        <button type="button" class="signal-btn label" onClick={() => bump(10)}>
          加 10
        </button>
        <button type="button" class="signal-btn label" onClick={reset}>
          重置
        </button>
      </div>
      <div class="counter-derived">
        <span>doubleCount()</span>
        <b>{count() * 2}</b>
      </div>
      <div class="counter-stats">
        <div class="counter-stat">
          <span>组件函数体执行</span>
          <strong>1 次</strong>
        </div>
        <div class="counter-stat">
          <span>DOM 文本更新</span>
          <strong>{updates()} 次</strong>
        </div>
      </div>
    </div>
  );
}
