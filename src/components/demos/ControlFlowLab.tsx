import { createSignal, For, Match, Repeat, Show, Switch, createStore } from "solid-js";

type Status = "idle" | "loading" | "error" | "ready";

const statusLabels: Record<Status, string> = {
  idle: "空闲",
  loading: "加载中",
  error: "出错",
  ready: "就绪",
};

type Task = { id: number; text: string; hits: number };

// 普通变量，不是响应式状态：只在事件处理函数里读写
let nextId = 4;

export function ControlFlowLab() {
  const [status, setStatus] = createSignal<Status>("ready");
  const [rows, setRows] = createStore({
    tasks: [
      { id: 1, text: "整理文档提纲", hits: 0 },
      { id: 2, text: "补全交互演示", hits: 0 },
      { id: 3, text: "检查移动端布局", hits: 0 },
    ] as Task[],
  });

  const addTask = () => {
    const id = nextId++;
    setRows((s) => {
      s.tasks.push({ id, text: `新任务 ${id}`, hits: 0 });
    });
  };

  const bumpTask = (id: number) => {
    setRows((s) => {
      const task = s.tasks.find((item) => item.id === id);
      if (task) task.hits += 1;
    });
  };

  const removeTask = (id: number) => {
    setRows((s) => {
      const index = s.tasks.findIndex((item) => item.id === id);
      if (index >= 0) s.tasks.splice(index, 1);
    });
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
                aria-pressed={status() === value ? "true" : "false"}
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
            <p>
              请求失败。同样的位置换成 <code>Errored</code> 边界，接住的就是异步读出的异常。
            </p>
          </Match>
          <Match when={status() === "ready"}>
            <p>内容已就绪，其余分支没有被创建。</p>
          </Match>
        </Switch>
      </div>

      <div class="flow-list-head">
        <span>For · 默认 keyed（按引用）</span>
        <button type="button" class="signal-btn label" onClick={addTask}>
          新增任务
        </button>
      </div>

      <Show
        when={rows.tasks.length > 0}
        fallback={<p class="flow-empty">列表为空。这是 Show 的 fallback 分支。</p>}
      >
        <ul class="flow-list">
          <For each={rows.tasks}>
            {(task) => (
              <li>
                <span>
                  {task.text} · 命中 {task.hits}
                </span>
                <span class="flow-buttons">
                  <button type="button" class="flow-remove" onClick={() => bumpTask(task.id)}>
                    命中 +1
                  </button>
                  <button
                    type="button"
                    class="flow-remove"
                    onClick={() => removeTask(task.id)}
                    aria-label={`移除 ${task.text}`}
                  >
                    移除
                  </button>
                </span>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <div class="flow-list-head">
        <span>Repeat · 同一个 store，按位置取</span>
      </div>
      <ul class="flow-list">
        <Repeat
          count={rows.tasks.length}
          fallback={<p class="flow-empty">Repeat 的 count 为 0，这里轮到 fallback。</p>}
        >
          {(i) => (
            <li>
              <span>
                槽位 {i}：{rows.tasks[i]?.text ?? "这一槽已回收"}
              </span>
              <span class="profile-id">hits {rows.tasks[i]?.hits ?? 0}</span>
            </li>
          )}
        </Repeat>
      </ul>
    </div>
  );
}
