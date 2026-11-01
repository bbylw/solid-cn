import { createSignal, For, Match, Show, Switch } from "solid-js";

type Status = "idle" | "loading" | "error" | "ready";

const statusLabels: Record<Status, string> = {
  idle: "空闲",
  loading: "加载中",
  error: "出错",
  ready: "就绪",
};

const initialTasks = ["整理文档提纲", "补全交互演示", "检查移动端布局"];

export function ControlFlowLab() {
  const [status, setStatus] = createSignal<Status>("ready");
  const [tasks, setTasks] = createSignal(initialTasks);
  const [counter, setCounter] = createSignal(0);

  const addTask = () => {
    setCounter((value) => value + 1);
    setTasks((list) => [...list, `新任务 ${counter()}`]);
  };

  const removeTask = (task: string) => {
    setTasks((list) => list.filter((item) => item !== task));
  };

  return (
    <div class="flow-lab">
      <div class="flow-lab-head">
        <span>Switch / Match</span>
        <div class="flow-buttons" role="group" aria-label="切换状态">
          <For each={Object.keys(statusLabels) as Status[]}>
            {(value) => (
              <button
                type="button"
                class="lab-step-btn"
                aria-pressed={status() === value}
                onClick={() => setStatus(value)}
              >
                {statusLabels[value]}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="flow-panel" data-status={status()}>
        <Switch fallback={<p>未知状态</p>}>
          <Match when={status() === "idle"}>
            <p>还没有开始。点击上方按钮切换状态。</p>
          </Match>
          <Match when={status() === "loading"}>
            <p>正在加载数据，界面只替换这一个分支。</p>
          </Match>
          <Match when={status() === "error"}>
            <p>请求失败。ErrorBoundary 可以在这里接住抛出的异常。</p>
          </Match>
          <Match when={status() === "ready"}>
            <p>内容已就绪，其余分支不会被创建。</p>
          </Match>
        </Switch>
      </div>

      <div class="flow-list-head">
        <span>For / 列表</span>
        <button type="button" class="signal-btn label" onClick={addTask}>
          新增任务
        </button>
      </div>

      <Show
        when={tasks().length > 0}
        fallback={<p class="flow-empty">列表为空。这是 Show 的 fallback 分支。</p>}
      >
        <ul class="flow-list">
          <For each={tasks()}>
            {(task) => (
              <li>
                <span>{task}</span>
                <button
                  type="button"
                  class="flow-remove"
                  onClick={() => removeTask(task)}
                  aria-label={`移除 ${task}`}
                >
                  移除
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
