import { createMemo, createStore, createSignal, For } from "solid-js";

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
  const [lastWrite, setLastWrite] = createSignal("createStore(initial)");

  const onlineCount = createMemo(
    () => state.members.filter((member) => member.online).length
  );

  // 1.x 要按下标写路径 setState("members", 0, "online", fn)，2.0 就是遍历草稿改这一项
  const toggle = (id: number) => {
    setState((draft) => {
      for (const member of draft.members) {
        if (member.id === id) member.online = !member.online;
      }
    });
    setLastWrite(`setState(s => { s.members 中 id=${id} 的 online 取反 })`);
  };

  const addMember = () => {
    // 先算好要写的值：这一轮里读取还是旧值，写入要到微任务末尾才可见
    const name = newcomers[nextName() % newcomers.length];
    const id = state.members.reduce((max, member) => Math.max(max, member.id), 0) + 1;

    setState((draft) => {
      draft.members.push({ id, name, role: "新加入的成员", online: true });
    });
    setNextName((value) => value + 1);
    setLastWrite("setState(s => { s.members.push({ id, name, ... }) })");
  };

  const removeLast = () => {
    setState((draft) => {
      draft.members.pop();
    });
    setLastWrite("setState(s => { s.members.pop() })");
  };

  const visit = () => {
    setState((draft) => {
      draft.visits += 1;
    });
    setLastWrite("setState(s => { s.visits += 1 })");
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
          {(member) => (
            <li class="store-row">
              <span class="store-presence" data-online={member.online} aria-hidden="true" />
              <span class="store-identity">
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </span>
              <button
                type="button"
                class="lab-step-btn store-toggle"
                aria-pressed={member.online ? "true" : "false"}
                onClick={() => toggle(member.id)}
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
        <button type="button" class="signal-btn label" onClick={removeLast}>
          移走末位
        </button>
        <p class="store-path">
          最近一次写入：<code>{lastWrite()}</code>
        </p>
      </div>
    </div>
  );
}
