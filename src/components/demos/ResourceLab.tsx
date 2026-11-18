import {
  affects,
  createMemo,
  createSignal,
  Errored,
  For,
  isPending,
  Loading,
  refresh,
  Show,
} from "solid-js";

type Profile = {
  id: number;
  name: string;
  role: string;
  city: string;
  commits: number;
  intro: string;
};

const profiles: Record<number, Profile> = {
  1: {
    id: 1,
    name: "林岚",
    role: "核心维护者",
    city: "杭州",
    commits: 1284,
    intro: "负责响应式内核与文档示例，喜欢把复杂机制画成图。",
  },
  2: {
    id: 2,
    name: "周野",
    role: "文档贡献者",
    city: "成都",
    commits: 316,
    intro: "维护文档与教程，关注新手第一次运行项目的体验。",
  },
  3: {
    id: 3,
    name: "许冬",
    role: "社区志愿者",
    city: "深圳",
    commits: 92,
    intro: "组织线下分享，维护组件库示例，正在写自己的 Solid 项目。",
  },
};

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

export function ResourceLab() {
  const [userId, setUserId] = createSignal(1);
  const [failMode, setFailMode] = createSignal(false);

  async function fetchProfile(id: number) {
    // 只有第一个 await 之前的读取会被跟踪：这里读一次失败开关，
    // 于是切换开关就等于换了一次输入，自动重新取数。
    const shouldFail = failMode();
    await sleep(650);
    if (shouldFail) throw new Error("演示：请求被主动拒绝");
    return profiles[id];
  }

  const profile = createMemo(() => fetchProfile(userId()));
  const updating = () => isPending(() => profile());

  const quietReload = () => refresh(profile);
  const declaredReload = () => {
    affects(profile);
    refresh(profile);
  };

  return (
    <div class="resource-lab">
      <div class="resource-toolbar">
        <div class="flow-buttons" role="group" aria-label="选择用户">
          <For each={[1, 2, 3]}>
            {(id) => (
              <button
                type="button"
                class="lab-step-btn"
                aria-pressed={userId() === id ? "true" : "false"}
                onClick={() => setUserId(id)}
              >
                用户 {id}
              </button>
            )}
          </For>
        </div>
        <div class="resource-toolbar-right">
          <button
            type="button"
            class="lab-step-btn"
            aria-pressed={failMode() ? "true" : "false"}
            onClick={() => setFailMode((value) => !value)}
          >
            {failMode() ? "恢复网络" : "模拟失败"}
          </button>
          <button type="button" class="lab-step-btn" onClick={quietReload}>
            静默 refresh
          </button>
          <button type="button" class="signal-btn label" onClick={declaredReload}>
            affects + refresh
          </button>
        </div>
      </div>

      <div class="resource-stage" aria-live="polite">
        <Errored
          fallback={(err) => (
            <div class="resource-error" role="alert">
              <strong>请求失败</strong>
              <p>{String(err())}</p>
              <p>
                重新取数靠 <code>refresh</code>：新答案一落地，边界就自动愈合，
                <code>reset</code> 只用来重试渲染期抛出的错误。
              </p>
              <button
                type="button"
                class="signal-btn label"
                onClick={() => {
                  setFailMode(false);
                  refresh(profile);
                }}
              >
                恢复网络并重试
              </button>
            </div>
          )}
        >
          <Loading
            fallback={
              <div class="resource-loading">
                <span class="live-dot" />
                正在载入 /api/users/{userId()}……
              </div>
            }
            on={userId()}
          >
            <Show when={updating()}>
              <div class="resource-loading">
                <span class="live-dot" />
                新的答案在路上，屏幕上还是上一份。
              </div>
            </Show>
            <div class="profile-card">
              <div class="profile-head">
                <span class="profile-avatar" aria-hidden="true">
                  {profile().name.slice(0, 1)}
                </span>
                <div>
                  <h4>{profile().name}</h4>
                  <p>
                    {profile().role} · {profile().city}
                  </p>
                </div>
                <span class="profile-id">id: {profile().id}</span>
              </div>
              <p class="profile-intro">{profile().intro}</p>
              <div class="profile-stats">
                <span>
                  <b>{profile().commits}</b>
                  提交
                </span>
                <span>
                  <b>{updating() ? "1" : "0"}</b>
                  在途
                </span>
              </div>
            </div>
          </Loading>
        </Errored>
      </div>

      <p class="resource-foot">
        <code>createMemo(() =&gt; fetchProfile(userId()))</code> 就是这次取数的全部代码：
        首次载入交给 <code>Loading</code>，输入变化后的在途交给 <code>isPending</code>，
        失败交给 <code>Errored</code>；<code>refresh</code> 安静，<code>affects</code> 才会点亮上面的指示器。
      </p>
    </div>
  );
}
