import { createMemo, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";

type Member = { id: number; name: string; role: string; online: boolean };

const initialMembers: Member[] = [
  { id: 1, name: "林岚", role: "核心维护者", online: true },
  { id: 2, name: "周野", role: "文档贡献者", online: false },
  { id: 3, name: "许冬", role: "社区志愿者", online: true },
];

const newcomers = ["阿棠", "陈屿", "顾川", "宋禾"];

export function StoreLab() {
  const [state, setState] = createStore({
    visits: 128,
    members: initialMembers,
  });
  const [nextName, setNextName] = createSignal(0);
  const [lastPath, setLastPath] = createSignal("createStore(initial)");

  const onlineCount = createMemo(
    () => state.members.filter((member) => member.online).length
  );

  const toggle = (index: number) => {
    setState("members", index, "online", (value) => !value);
    setLastPath(`setState("members", ${index}, "online", ...)`);
  };

  const addMember = () => {
    const name = newcomers[nextName() % newcomers.length];
    setState("members", (members) => [
      ...members,
      {
        id: members.length + 1,
        name,
        role: "新加入的成员",
        online: true,
      },
    ]);
    setNextName((value) => value + 1);
    setLastPath('setState("members", (list) => [...list, member])');
  };

  const visit = () => {
    setState("visits", (value) => value + 1);
    setLastPath('setState("visits", (n) => n + 1)');
  };

  return (
    <div class="store-lab">
      <div class="store-lab-stats">
        <div>
          <span>在线成员</span>
          <strong>{onlineCount()}</strong>
        </div>
        <div>
          <span>总访问量</span>
          <strong>{state.visits}</strong>
        </div>
        <button type="button" class="signal-btn label" onClick={visit}>
          访问 +1
        </button>
      </div>

      <ul class="store-list">
        <For each={state.members}>
          {(member, index) => (
            <li class="store-row">
              <span class="store-presence" data-online={member.online} aria-hidden="true" />
              <span class="store-identity">
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </span>
              <button
                type="button"
                class="lab-step-btn store-toggle"
                aria-pressed={member.online}
                onClick={() => toggle(index())}
              >
                {member.online ? "在线" : "离线"}
              </button>
            </li>
          )}
        </For>
      </ul>

      <div class="store-lab-foot">
        <button type="button" class="signal-btn label" onClick={addMember}>
          新增成员
        </button>
        <p class="store-path">
          最近更新：<code>{lastPath()}</code>
        </p>
      </div>
    </div>
  );
}
