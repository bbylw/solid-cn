import { createResource, createSignal, For, Show } from "solid-js";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ResourceLab() {
  const [userId, setUserId] = createSignal(1);
  const [shouldFail, setShouldFail] = createSignal(false);
  const [requestCount, setRequestCount] = createSignal(0);

  const [profile, { refetch }] = createResource(userId, async (id) => {
    setRequestCount((value) => value + 1);
    await sleep(650);
    if (shouldFail()) {
      throw new Error("演示：请求被主动拒绝");
    }
    return profiles[id];
  });

  const failNext = () => {
    setShouldFail((value) => !value);
  };

  const retry = () => {
    setShouldFail(false);
    refetch();
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
                aria-pressed={userId() === id}
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
            aria-pressed={shouldFail()}
            onClick={failNext}
          >
            {shouldFail() ? "恢复网络" : "模拟失败"}
          </button>
          <button type="button" class="signal-btn label" onClick={retry}>
            重新请求
          </button>
        </div>
      </div>

      <div class="resource-stage" aria-live="polite">
        <Show
          when={!profile.loading}
          fallback={
            <div class="resource-loading">
              <span class="live-dot" />
              正在请求 /api/users/{userId()}……
            </div>
          }
        >
          <Show
            when={!profile.error}
            fallback={
              <div class="resource-error" role="alert">
                <strong>请求失败</strong>
                <p>
                  {profile.error instanceof Error
                    ? profile.error.message
                    : "未知错误"}
                </p>
                <button type="button" class="signal-btn label" onClick={retry}>
                  重试
                </button>
              </div>
            }
          >
            <Show
              when={profile()}
              fallback={<p class="flow-empty">这个用户暂时没有资料。</p>}
            >
              {(user) => (
                <div class="profile-card">
                  <div class="profile-head">
                    <span class="profile-avatar" aria-hidden="true">
                      {user().name.slice(0, 1)}
                    </span>
                    <div>
                      <h4>{user().name}</h4>
                      <p>
                        {user().role} · {user().city}
                      </p>
                    </div>
                    <span class="profile-id">id: {user().id}</span>
                  </div>
                  <p class="profile-intro">{user().intro}</p>
                  <div class="profile-stats">
                    <span>
                      <b>{user().commits}</b>
                      提交
                    </span>
                    <span>
                      <b>{requestCount()}</b>
                      请求次数
                    </span>
                  </div>
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </div>

      <p class="resource-foot">
        <code>createResource(userId, fetcher)</code>
        会在 userId 变化时自动重新请求。加载、错误、空数据在这里都是普通分支。
      </p>
    </div>
  );
}
